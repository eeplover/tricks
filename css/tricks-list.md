# CSS Tricks

> tricks 尽量不包含兼容性代码，把这部分工作留给工具。例如：fis3-postprocessor-autoprefixer


* 移除input元素获取焦点时出现的轮廓
```css
input {
  outline: none;
}
```

* 将某个元素设置为可编辑状态
```html
<div contenteditable="true">我是可编辑的哦</div>
```

* IOS视频内联播放
```html
<!-- IOS4+支持webkit-playinline；IOS10+支持playinline -->
<video webkit-playinline playinline></video>
```

* 清除浮动
```less
// less
.clearfix {
    *zoom: 1;
    &:after,
    &:before {
        display: table;
        content: "";
    }
    &:after {
        clear: both;
    }
}
```

* 文本溢出显示`...`   

```less
// less
// 单行
.ellipsis() {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// webkit浏览器下可实现多行溢出显示 ...
.ellipsis-mul(@line: 2) {
  display: -webkit-box;
  -webkit-line-clamp: @line;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

* 固定块与屏幕左右的距离，实现宽度自适应
```css
div {
  position: absolute;
  left: 100px;
  right: 150px;
}
```

* 禁止用户选中脚本
```css
div {
  user-select: none;
}
```

* 设置移动浏览器点击链接的时候出现的高亮颜色
```css
a {
  -webkit-tap-highlight-color: rgba(0,0,0,0);
}
```

* 设置滚动条样式（适用于webkit浏览器）
```css
::-webkit-scrollbar {
  display: none;
}
```

* 移除表单控件的默认样式
```css
input, button, textarea, select {
    -webkit-appearance: none;
}
```

* CSS开启硬件加速
```css
div {
  -webkit-transform: translateZ(0);
}
```

* 禁止长按链接与图片弹出菜单
```css
div {
  -webkit-touch-callout: none;
}
```

* 计算属性值
```css
div {
    width: calc(100% - 100px);
}
```

* 字体平滑
```css
div {
    -webkit-font-smoothing: antialiased;
}
```

* CSS3 filter Property 图片过滤
```css
img {
    filter: grayscale(100%); //灰度
    filter: blur(5px); //模糊
    filter: brightness(200%); //高亮
    filter: saturate(8); //饱和
    filter: sepia(100%); //怀旧
    ...
}
```
> [css3 filter](https://www.w3schools.com/cssref/css3_pr_filter.asp)

* clip属性，截取你想要显示的图片
```css
img {
    position: absolute;
    clip: rect(0px,60px,200px,0px);
}
```

* 设置字符间距
```css
p {
    letter-spacing: *px; //也可以是负数
}
```

* flex兼容方案
```less
// less
.flex() {
  display: -webkit-box; /* Chrome 4+, Safari 3.1, iOS Safari 3.2+ */
  display: -moz-box; /* Firefox 17- */
  display: -webkit-flex; /* Chrome 21+, Safari 6.1+, iOS Safari 7+, Opera 15/16 */
  display: -moz-flex; /* Firefox 18+ */
  display: -ms-flexbox; /* IE 10 */
  display: flex; /* Chrome 29+, Firefox 22+, IE 11+, Opera 12.1/17/18, Android 4.4+ */
}
```
> 可以通过 autoprefixer 工具自动添加兼容性前缀。

* 控制元素在移动设备上是否使用滚动回弹效果  
```less
/* 当手指从触摸屏上移开，会保持一段时间的滚动 */
-webkit-overflow-scrolling: touch;
 /* 当手指从触摸屏上移开，滚动会立即停止 */
-webkit-overflow-scrolling: auto;
```

* flex  
[flex box froggy](http://flexboxfroggy.com/)、[a guide to flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
