<template>
    <div class="container">
        <Scratch flex=1  :savebtn="save" :loadbtn="load"/>
        <input type="file" />
        <el-dialog title="保存脚本" :visible.sync="dialogVisible" height="200px">
          <el-form :model="form">
            <el-form-item label="文件名" label-width="80px">
              <el-col :span="20">
                <el-input v-model="form.name" autocomplete="off"></el-input>
              </el-col>
              <el-col class="yuchang-ext" :span="4">.yu</el-col>
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
.container {
  overflow: hidden;
  height: 100%;
}

.container input {
  display: none;
}

.yuchang-ext {
  text-align: left;
}
</style>

<script>
import Scratch from "../components/Scratch.vue";
import yuchg from "../base";
import logger from "../logger";
import $ from "jquery";
import saveAs from "file-saver";

export default {
  data: function() {
    return {
      dialogVisible: false,
      form: {
        name: 'test'
      },
      dialogCallback: null
    }
  },
  components: {
    Scratch
  },
  computed: {
    load: function() {
      return {
        img: "/img/open.svg",
        action: this.selectFile
      };
    },
    save: function() {
      return {
        img: "/img/save.svg",
        action: this.openSaveDialog
      };
    }
  },
  methods: {
    selectFile(panel) {
      const $dom = $(this.$el);
      $dom
        .children("input")
        .on("change", () => {
          let _panel = panel;
          let file = $dom.children("input").val();
          if (event.target.files.length === 0) {
            return;
          }

          var reader = new FileReader();
          reader.onload = function() {
            _panel.load(this.result);
          };
          reader.readAsText(event.target.files[0]);
          $dom.children("input").val("");
        })
        .click();
    },
    openSaveDialog(panel) {
      // 弹出输入名称对话框
      this.dialogVisible = true
      this.dialogCallback = this.saveFile.bind(this, panel)
    },
    callbackSaveFile() {
      this.dialogVisible = false
      if (this.dialogCallback) {
        this.dialogCallback()
      }
    },
    saveFile(panel) {
      const $dom = $(this.$el);
      let data = panel.save();

      let file = new File([data], this.form.name + ".yu", {
        type: "text/plain;charset=utf-8"
      });
      saveAs(file);
    }
  },
  mounted: function() {}
};
</script>
