/**
 * @title RequireJS 源码解读
 * @aim   理解RequireJs的主要原理
 * @tips  浏览器环境，不考虑兼容性，不处理异常，不考虑误操作
 */

var require, define
;(function (global) {
    var contexts = {},

        op = Object.prototype,
        ostring = op.toString,
        hasOwn = op.hasOwnProperty,

        globalDefQueue = [],
        cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g

    // 模块定义
    define = function (name, deps, callback) {
        var node

        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            callback = deps
            deps = name
            name = null
        }

        //This module may not have dependencies
        if (!isArray(deps)) {
            callback = deps
            deps = null
        }

        //If no name, and callback is a function, then figure out if it a
        //CommonJS thing with dependencies.
        if (!deps && isFunction(callback)) {
            deps = []
            //Remove comments from the callback string,
            //look for require calls, and pull them into the dependencies,
            //but only if there are function args.
            if (callback.length) {
                deps.push('require')
                callback
                    .toString()
                    .replace(cjsRequireRegExp, function (match, dep) {
                        deps.push(dep)
                    })
            }
        }

        globalDefQueue.push([name, deps, callback])
    }

    function isArray(it) {
        return ostring.call(it) === '[object Array]'
    }

    function isFunction(it) {
        return ostring.call(it) === '[object Function]'
    }

    function bind(obj, fn) {
        return function () {
            fn.apply(obj, arguments)
        }
    }

    function each(ary, func) {
        if (ary) {
            for (var i = 0; i < ary.length; i++) {
                if (ary[i] && func(ary[i], i, ary)) break
            }
        }
    }

    function eachProp(obj, func) {
        var prop;
        for (prop in obj) {
            if (hasProp(obj, prop)) {
                if (func(obj[prop], prop)) {
                    break;
                }
            }
        }
    }

    // 入口函数
    require = function (deps, callback) {
        var context, contextName = '_'

        context = getOwn(contexts, contextName)

        if (!context) {
            context = contexts[contextName] = require.s.newContext(contextName)
        }

        return context.require(deps, callback)
    }

    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop]
    }

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop)
    }

    require.s = {
        newContext: newContext
    }

    // 创建执行上下文对象
    function newContext(contextName) {
        var inCheckLoaded,
            Module,
            context,
            checkLoadedTimeoutId,
            config = {
                waitSeconds: 7,
                baseUrl: './',
                paths: {}
            },
            // 放置Module对象
            registry = {},
            // globalDefQueue的中转站
            defQueue = [],
            // 存放Module exports的结果
            defined = {},
            urlFetched = {},
            undefEvents = {},
            // 放置enabled=true的Module对象
            enabledRegistry = {},
            requireCounter = 1

        function checkLoaded() {
            var waitInterval = 7000,
                expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
                stillLoading = false

            //Do not bother if this call was a result of a cycle break.
            if (inCheckLoaded) {
                return
            }

            inCheckLoaded = true

            //Figure out the state of all the modules.
            eachProp(enabledRegistry, function (mod) {
                var map = mod.map,
                    modId = map.id

                //Skip things that are not enabled or in error state.
                if (!mod.enabled) {
                    return
                }

                if (!mod.error) {
                    stillLoading = true
                }
            })

            if (expired) {
                console.error('Load timeout for modules: ', modId)
                return
            }

            if (!expired && stillLoading) {
                if (!checkLoadedTimeoutId) {
                    checkLoadedTimeoutId = setTimeout(function () {
                        checkLoadedTimeoutId = 0
                        checkLoaded()
                    }, 50)
                }
            }

            inCheckLoaded = false
        }

        handlers = {
            require: function (mod) {
                if (mod.require) {
                    return mod.require;
                } else {
                    return (mod.require = context.makeRequire(mod.map));
                }
            }
        }

        function on(depMap, name, fn) {
            var id = depMap.id,
                mod = getOwn(registry, id)

            if (hasProp(defined, id) &&
                    (!mod || mod.defineEmitComplete)) {
                if (name === 'defined') {
                    fn(defined[id])
                }
            } else {
                mod = getModule(depMap)
                if (mod.error && name === 'error') {
                    fn(mod.error)
                } else {
                    mod.on(name, fn)
                }
            }
        }

        function cleanRegistry(id) {
            delete registry[id]
            delete enabledRegistry[id]
        }

        function makeModuleMap(name) {
            var url,
                isDefine = true

            if (!name) {
                isDefine = false
                name = '_@r' + (requireCounter += 1)
            }

            url = context.nameToUrl(name)

            return {
                id: name,
                name: name,
                url: url
            }
        }

        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id)
            if (!mod) {
                mod = registry[id] = new context.Module(depMap)
            }

            return mod
        }

        Module = function (map) {
            this.map = map
            this.exports = {}
            this.depCount = 0
            this.depExports = []
            this.depMatched = []
            this.events = getOwn(undefEvents, map.id) || {}
        }

        Module.prototype = {
            // 设置Module的依赖及回调
            init: function (depMaps, factory, options = {}) {
                if (this.inited) return

                this.factory = factory
                this.depMaps = depMaps
                this.inited = true

                if (options.enabled || this.enabled) {
                    this.enable()
                } else {
                    this.check()
                }
            },

            // 加载当前模块以及它的依赖模块
            enable: function () {
                enabledRegistry[this.map.id] = this
                this.enabled = true

                //Set flag mentioning that the module is enabling,
                //so that immediate calls to the defined callbacks
                //for dependencies do not trigger inadvertent load
                //with the depCount still being zero.
                this.enabling = true

                //Enable each dependency
                each(this.depMaps, bind(this, function (depMap, i) {
                    var id, mod, handler

                    if (typeof depMap === 'string') {
                        //Dependency needs to be converted to a depMap
                        //and wired up to this module.
                        depMap = makeModuleMap(depMap)
                        this.depMaps[i] = depMap

                        handler = getOwn(handlers, depMap.id)

                        if (handler) {
                            this.depExports[i] = handler(this)
                            return
                        }

                        this.depCount += 1

                        on(depMap, 'defined', bind(this, function (depExports) {
                            if (this.undefed) {
                                return
                            }
                            this.defineDep(i, depExports)
                            this.check()
                        }))
                    }

                    id = depMap.id
                    mod = registry[id]

                    //Skip special modules like 'require', 'exports', 'module'
                    //Also, don't call enable if it is already enabled,
                    //important in circular dependency cases.
                    if (!hasProp(handlers, id) && mod && !mod.enabled) {
                        context.enable(depMap, this)
                    }
                }))

                this.enabling = false

                this.check()
            },

            // 检查当前Module的状态，1. 是否加载；2. 检查depCount值，若为0，返回exports，并触发自身的defined事件。
            check: function () {
                if (!this.enabled || this.enabling) {
                    return
                }

                var id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory

                if (!this.inited) {
                    // Only fetch if not already in the defQueue.
                    if (!hasProp(context.defQueueMap, id)) {
                        this.fetch()
                    }
                } else if (!this.defining) {
                    //The factory could trigger another require call
                    //that would result in checking this module to
                    //define itself again. If already in the process
                    //of doing that, skip this work.
                    this.defining = true

                    if (this.depCount < 1 && !this.defined) {
                        if (isFunction(factory)) {
                            exports = context.execCb(id, factory, depExports, exports)
                        } else {
                            //Just a literal value
                            exports = factory
                        }

                        this.exports = exports

                        if (this.map.isDefine && !this.ignore) {
                            defined[id] = exports
                        }

                        //Clean up
                        cleanRegistry(id)

                        this.defined = true
                    }

                    //Finished the define stage. Allow calling check again
                    //to allow define notifications below in the case of a
                    //cycle.
                    this.defining = false

                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true
                        this.emit('defined', this.exports)
                        this.defineEmitComplete = true
                    }

                }
            },

            fetch: function () {
                if (this.fetched) {
                    return
                }
                this.fetched = true

                this.load()
            },

            load: function () {
                var url = this.map.url

                if (!urlFetched[url]) {
                    urlFetched[url] = true
                    context.load(this.map.id, url)
                }
            },

            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },

            emit: function (name, evt) {
                each(this.events[name], function (cb) {
                    cb(evt)
                })
                if (name === 'error') {
                    //Now that the error handler was triggered, remove
                    //the listeners, since this broken Module instance
                    //can stay around for a while in the registry.
                    delete this.events[name]
                }
            },

            defineDep: function (i, depExports) {
                //Because of cycles, defined callback for a given
                //export can be called more than once.
                if (!this.depMatched[i]) {
                    this.depMatched[i] = true
                    this.depCount -= 1
                    this.depExports[i] = depExports
                }
            },
        }

        function callGetModule(args) {
            if (!hasProp(defined, args[0])) {
                getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2])
            }
        }

        function intakeDefines() {
            var args
            takeGlobalQueue()
            while (defQueue.length) {
                var args = defQueue.shift()
                if (args[0] == null) {
                    // @TODO error catch
                } else {
                    callGetModule(args)
                }
            }
            context.defQueueMap = {}
        }

        function takeGlobalQueue() {
            if (globalDefQueue.length) {
                each(globalDefQueue, function (queueItem) {
                    var id = queueItem[0]
                    if (typeof id === 'string') {
                        context.defQueueMap[id] = true
                    }
                    defQueue.push(queueItem)
                })
                globalDefQueue = []
            }
        }

        context = {
            Module: Module,
            contextName: contextName,
            nextTick: require.nextTick,

            require: function (deps, callback) {
                this.nextTick(function () {
                    intakeDefines()
                    requireMod = getModule(makeModuleMap())
                    requireMod.init(deps, callback, { enabled: true })
                })
            },

            enable: function (depMap) {
                var mod = getOwn(registry, depMap.id)
                if (mod) {
                    getModule(depMap).enable()
                }
            },

            nameToUrl: function (moduleName) {
                return config.baseUrl + moduleName + '.js'
            },

            load: function (id, url) {
                require.load(context, id, url)
            },

            onScriptLoad: function (evt) {
                var node = evt.currentTarget || evt.srcElement

                node.removeEventListener('load', context.onScriptLoad)
                context.completeLoad(node && node.getAttribute('data-requiremodule'))
            },

            completeLoad: function (moduleName) {
                var found, args, mod

                takeGlobalQueue()

                while (defQueue.length) {
                    args = defQueue.shift()
                    if (args[0] === null) {
                        args[0] = moduleName
                        if (found) {
                            break
                        }
                        found = true
                    } else if (args[0] === moduleName) {
                        found = true
                    }

                    callGetModule(args)
                }
                context.defQueueMap = {}
                checkLoaded()
            },

            execCb: function (name, callback, args, exports) {
                return callback.apply(exports, args)
            }
        }

        return context
    }

    require.nextTick = function (fn) {
        typeof setTimeout !== 'undefined' ? setTimeout(fn, 4) : fn()
    }

    // 执行依赖模块的加载
    require.load = function (context, moduleName, url) {
        var head = document.getElementsByTagName('head')[0]
        var node = document.createElement('script')

        node.setAttribute('data-requiremodule', moduleName)
        node.setAttribute('data-requirecontext', context.contextName)
        node.addEventListener('load', context.onScriptLoad, false)

        node.type = 'text/javascript'
        node.charset = 'utf-8'
        node.async = true
        node.src = url

        head.appendChild(node)

        return node
    }

    // 创建默认执行上下文
    require({})

})(this)
