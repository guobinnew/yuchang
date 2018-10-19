# yuchang
模仿Scratch的基于Vue的可视化脚本编辑工具，支持自定义语法，导出为JSON格式、JS代码，主要特点：
-（1）完全通过JSON定义脚本Block，可自由扩展，甚至创建一套全新Block，可以实现各种可视化脚本应用，不仅仅用于编程
-（2）支持导出插件，可自行实现将可视化模型导出为想要的文件，例如JSON、JS代码、Word、HTML等

Vue主要用于实现SPA框架，Scratch编辑器能够很容易脱离Vue环境，应用到其他Web应用中
![image](https://github.com/guobinnew/yuchang/blob/master/screenshots/mainui.png)

## Command模块
为了方便脚本重用，引入Command（命令），可以将一个脚本序列定义为一个Command，然后在其他地方执行它
![image](https://github.com/guobinnew/yuchang/blob/master/screenshots/command.png)

## 自行扩展Block
中文诗歌
![image](https://github.com/guobinnew/yuchang/blob/master/screenshots/chinese.png)

## Demo运行步骤
- (1）安装Node环境，全局安装Vue-CLI

- (2）从Github Clone本项目源码

- (3）在项目根目录运行 npm install， 在client/目录下运行npm install

- (4) 在控制台运行Vue ui，选择项目目录为client/目录，通过UI控制台运行服务即可
