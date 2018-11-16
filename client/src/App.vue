<template>
    <div id="app">
        <el-container class="yuchang-main">
            <el-aside width="65px">
                <div class="yuchang-logo-menu">
                    <img src="./assets/logo.png" width="36" height="36" class="yuchang-middle"/>
                </div>
                <el-menu default-active="1-4-1" class="el-menu-vertical-demo" :collapse="isCollapse">
                     <el-menu-item index="1" disabled>
                        <i class="el-icon-location"></i>
                        <span slot="title">导航一</span>
                    </el-menu-item>
                    <el-menu-item index="2" disabled>
                        <i class="el-icon-menu"></i>
                        <span slot="title">导航二</span>
                    </el-menu-item>
                    <el-menu-item index="3" disabled>
                        <i class="el-icon-document"></i>
                        <span slot="title">导航三</span>
                    </el-menu-item>
                    <el-menu-item index="4" disabled>
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
                        <el-menu-item index="1">可视化脚本</el-menu-item>
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

    .el-dialog {
      line-height: 40px;
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
          this.$router.push({ name: 'editor' })
        } 
        console.log(key, keyPath)
      }
    }
  }
</script>
