<template>
    <div class="container" v-resize="onContainerResize">
        <div id="scratch" class="scratch" :style="{width: size.width + 'px', height: size.height + 'px'}"></div>
        <!-- <Scratch flex=1  :savebtn="save" :loadbtn="load" :export="openExportDialog"/> -->
        <input id="yuchang-save" type="file" />
        <el-dialog title="保存脚本" :visible.sync="dialogVisible" height="200px">
          <el-form :model="form">
            <el-form-item label="文件名" label-width="80px">
              <el-col :span="20">
                <el-input v-model="form.name" autocomplete="off"></el-input>
              </el-col>
              <el-col class="yuchang-ext" :span="4">{{form.ext}}</el-col>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="callbackSaveFile">确 定</el-button>
          </div>
        </el-dialog>
    </div>
</template>

<style scoped>
@import "../scratch/style.css";

.container {
  overflow: hidden;
  height: 100%;
}

.container input {
  display: none;
}

.scratch {
  overflow: hidden;
}

.yuchang-ext {
  text-align: left;
}
</style>

<script>
import Scratch from "../scratch/index"
import yuchg from "../base"
import logger from "../logger"
import saveAs from "file-saver"
import resize from 'vue-resize-directive'

export default {
  data: function() {
    return {
      dialogVisible: false,
      form: {
        name: 'test',
        ext: '.yu'
      },
      dialogCallback: null,
      editor: null,
      size: {
        width: 0,
        height: 0
      }
    }
  },
  directives: {
    resize,
  },
  computed: {
    load: function() {
      return {
        img: "/img/open.svg",
        action: this.selectFile
      }
    },
    save: function() {
      return {
        img: "/img/save.svg",
        action: this.openSaveDialog
      }
    }
  },
  methods: {
    selectFile(panel) {
      const elem = document.querySelector('#yuchang-save')

      elem.addEventListener('change', () => {
          let _panel = panel
          let file = elem.value
          if (event.target.files.length === 0) {
            return
          }

          var reader = new FileReader()
          reader.onload = function() {
            _panel.load(this.result)
          }
          reader.readAsText(event.target.files[0])
          elem.value = ''
        })
        .click()
    },
    openSaveDialog(panel) {
      // 弹出输入名称对话框
      this.form.ext = '.yu'
      this.dialogVisible = true
      this.dialogCallback = this.saveFile.bind(this, panel)
    },
    callbackSaveFile() {
      this.dialogVisible = false
      if (this.dialogCallback) {
        this.dialogCallback()
      }
    },
    openExportDialog(panel, ext, data) {
      // 弹出输入名称对话框
      this.form.ext = ext
      this.dialogVisible = true
      this.dialogCallback = this.exportFile.bind(this, panel, data)
    },
    saveFile(panel) {
      let data = panel.save()
      let file = new File([data], this.form.name + this.form.ext, {
        type: "text/plain;charset=utf-8"
      })
      saveAs(file)
    },
    exportFile(panel, data) {
      let output = '' 
      if (yuchg.isObject(data) || yuchg.isArray(data)) {
        output = JSON.stringify(data)
      } else if (yuchg.isString(data)) {
        output = data
      } else {
        output = '' + data
      }

      let file = new File([output], this.form.name + this.form.ext, {
        type: "text/plain;charset=utf-8"
      })
      saveAs(file)
    },
    onContainerResize() {
      this.size.width = this.$el.clientWidth
      this.size.height = this.$el.clientHeight
      this.$nextTick( () => {
        this.editor.resize()
      })
    }
  },
  mounted: function() {
    let dom = document.getElementById('scratch')
    this.editor = Scratch.init(dom)
    this.editor.setOption({})
    // 随窗口动态改变大小
    this.onContainerResize()
  }
}
</script>
