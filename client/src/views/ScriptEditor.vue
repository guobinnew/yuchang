<template>
    <div class="container">
        <Scratch flex=1  :savebtn="save" :loadbtn="load"/>
        <input type="file" />
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
</style>

<script>

  import Scratch from '../components/Scratch.vue'
  import yuchg from '../base'
  import logger from '../logger'
  import $ from 'jquery'
  import saveAs from 'file-saver'

  export default {
    data: function () {
      return {}
    },
    components: {
      Scratch
    },
    computed: {
      load: function() {
        return {
          img: '/img/open.svg',
          action: this.selectFile
        }
      },
      save: function() {
        return {
          img: '/img/save.svg',
          action: this.saveFile
        }
      }
    },
    methods: {
      selectFile(panel) {
        const $dom = $(this.$el)
        $dom.children('input').on('change', ()=>{
          let _panel = panel
          let file = $dom.children('input').val()
          if(event.target.files.length === 0) {
            return
          }

          var reader = new FileReader()
          reader.onload = function() {  
             _panel.load(this.result)
          }
          reader.readAsText(event.target.files[0])
          $dom.children('input').val('')
        }).click()
      },
      saveFile(panel) {
        const $dom = $(this.$el)
        let data = panel.save()
        let file = new File([data], "test.yu", {type: "text/plain;charset=utf-8"})
        saveAs(Blob)
      }
    },
    mounted: function() {
    }
  }

</script>
