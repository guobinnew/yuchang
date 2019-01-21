# yuchang-base

可视化脚本编辑工具Yuchang的插件库，提供基础的Block定义, 
注意：yuchg版本必须1.2.0以上

## 使用步骤

+  (1）安装 npm install --save yuchg-base
+  (2）引入

```
  import yuchg from 'yuchg'
  import base from 'yuchg-base'
  import 'yuchg/css/style.css'

  let editor = yuchg.Scratch.init(dom)
  editor.setOption({
    packages: [base]
  })
   
```
