var define, require

(function (){
  var deps = [],
    consext = null,
    globalQueue = [],
    cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g

  define = function (name, deps, callback) {
    // 未配置模块名
    if (typeof name !== 'string') {
      callback = deps
      deps = name
      name = ''
    }

    // 未配置模块名或未配置模块名与依赖模块
    if (!Array.isArray(deps)) {
      callback = deps
      deps = []
    }

    callback
      .toString()
      .replace(cjsRequireRegExp, function (match, dep) {
        deps.push(dep)
      })

    globalQueue.push({
      name: name,
      deps: deps,
      factory: callback
    })
  }

  require = function (deps, callback) {
    if (context) {
      context = createContext()
    }
    context.require(deps, callback)
  }

  function createContext() {
    var Module = function (dep) {
      this.id = dep
    }
    Module.prototype.init = function () {

    }

    var context = {
      module: Module,
      require: function (deps, factory) {
        setTimeout(() => {
          deps.forEach(dep => {
            new Module(dep).init()
          })
        }, 4)
      }
    }
    return context
  }

  function load() {

  }

  function onScriptLoad() {

  }

})()
