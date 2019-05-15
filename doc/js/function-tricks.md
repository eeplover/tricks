# Function Tricks

### Element.getBoundingClientRect()  

返回元素的大小及其相对于视口的位置。  

> 可用于判断元素是否处于视口内部


### Document.elementFromPoint()  

返回当前文档上处于指定坐标位置最顶层的元素，坐标是相对于包含该文档的浏览器窗口的左上角为原点来计算的，通常 x 和 y 坐标都应为正数。

> 可用于查找处于当前视口内部的元素


### History.replaceState()

替换最近一次访问历史栈里的记录，不刷新页面。
