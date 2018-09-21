<template>
    <div id="app">
        <el-container class="yuchang-main">
            <el-aside width="65px">
                <div class="yuchang-logo-menu">
                    <img src="./assets/logo.png" width="36" height="36" class="yuchang-middle"/>
                </div>
                <el-menu default-active="1-4-1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
                         :collapse="isCollapse">
                    <el-submenu index="1">
                        <template slot="title">
                            <i class="el-icon-location"></i>
                            <span slot="title">导航一</span>
                        </template>
                        <el-menu-item-group>
                            <span slot="title">分组一</span>
                            <el-menu-item index="1-1">选项1</el-menu-item>
                            <el-menu-item index="1-2">选项2</el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="分组2">
                            <el-menu-item index="1-3">选项3</el-menu-item>
                        </el-menu-item-group>
                        <el-submenu index="1-4">
                            <span slot="title">选项4</span>
                            <el-menu-item index="1-4-1">选项1</el-menu-item>
                        </el-submenu>
                    </el-submenu>
                    <el-menu-item index="2">
                        <i class="el-icon-menu"></i>
                        <span slot="title">导航二</span>
                    </el-menu-item>
                    <el-menu-item index="3" disabled>
                        <i class="el-icon-document"></i>
                        <span slot="title">导航三</span>
                    </el-menu-item>
                    <el-menu-item index="4">
                        <i class="el-icon-setting"></i>
                        <span slot="title">导航四</span>
                    </el-menu-item>
                </el-menu>
            </el-aside>
            <el-container>
                <el-header>
                    <el-menu
                            :default-active="activeIndex"
                            class="el-menu-demo"
                            mode="horizontal"
                            @select="handleSelect"
                            background-color="#545c64"
                            text-color="#fff"
                            active-text-color="#ffd04b">
                        <el-menu-item index="1">模型预览</el-menu-item>
                        <el-submenu index="2">
                            <template slot="title">我的工作台</template>
                            <el-menu-item index="2-1">选项1</el-menu-item>
                            <el-menu-item index="2-2">选项2</el-menu-item>
                            <el-menu-item index="2-3">选项3</el-menu-item>
                            <el-submenu index="2-4">
                                <template slot="title">选项4</template>
                                <el-menu-item index="2-4-1">选项1</el-menu-item>
                                <el-menu-item index="2-4-2">选项2</el-menu-item>
                                <el-menu-item index="2-4-3">选项3</el-menu-item>
                            </el-submenu>
                        </el-submenu>
                        <el-menu-item index="3">模型关系网络</el-menu-item>
                        <el-menu-item index="4">可视化脚本</el-menu-item>
                    </el-menu>
                </el-header>
                <el-main>
                    <router-view/>
                </el-main>
                <el-footer>
                    <h4>@2018 Unique 版权所有</h4>
                </el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        height: 100%;
        width: 100%;
    }

    #nav {
        padding: 30px;
        a {
            font-weight: bold;
            color: #2c3e50;
            &.router-link-exact-active {
                color: #42b983;
            }
        }
    }

    .yuchang-main {
        height: 100%;
        width: 100%;
    }

    .yuchang-logo-menu {
        height: 58px;
        text-align: center;
        padding: 0;
    }

    .yuchang-middle {
        display: inline-block;
        vertical-align: middle;
    }

    .el-menu-vertical-demo {
        height: 100%;
    }

    .el-header, .el-footer {
        background-color: #B3C0D1;
        color: #333;
        text-align: center;
        line-height: 60px;
        padding: 0;
    }

    .el-aside {
        color: #333;
        text-align: center;
        line-height: 58px;
        overflow: hidden;
    }

    .el-main {
        background-color: #E9EEF3;
        color: #333;
        text-align: center;
        line-height: 160px;
        padding: 0;
        height: 100%;
    }

    body > .el-container {
        margin-bottom: 40px;
    }

    .el-container:nth-child(5) .el-aside,
    .el-container:nth-child(6) .el-aside {
        line-height: 260px;
    }

    .el-container:nth-child(7) .el-aside {
        line-height: 320px;
    }

    .el-footer{
        text-align: right;
        padding-right: 20px;
        color: #666;
    }

</style>

<script>
  import ElContainer from '../node_modules/element-ui/packages/container/src/main'

  export default {
    components: {ElContainer},
    data () {
      return {
        activeIndex: '1',
        isCollapse: true
      }
    },
    methods: {
      handleSelect (key, keyPath) {
        if (key == 1) {
          this.$router.push({ name: 'home' })
        }
        else if (key == 4) {
          this.$router.push({ name: 'scratch' })
        }
        else if (key == 3) {
          this.$router.push({ name: 'nomview' })
        }
        console.log(key, keyPath)
      },
      handleOpen (key, keyPath) {
        console.log(key, keyPath)
      },
      handleClose (key, keyPath) {
        console.log(key, keyPath)
      }
    }
  }
</script>
