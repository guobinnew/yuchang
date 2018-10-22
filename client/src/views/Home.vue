<template>
  <div :id="id" class="home" style="position: relative">
    <div class="container"></div>
  </div>
</template>

<style>
  .home{
    height: 100%;
    overflow: hidden;
  }

  .container {

  }
</style>
<script>
  import $ from 'jquery'
  import * as THREE from 'three'
  import GLTFLoader  from 'three-gltf-loader'
  import OrbitControls from 'three-orbitcontrols'

  const scene = new THREE.Scene()

export default {
  name: 'home',
  data: function () {
    return {
      id: 'home'
    }
  },
  components: {
  },
  mounted: function () {
    var that = this
    var scene, camera, pointLight
    var renderer, mixer, controls
    var clock = new THREE.Clock()
    var $container = $('.container')

    var resizeCanvas = function () {
      let $main = $('.el-main')
      that.width = $main[0].clientWidth
      that.height = $main[0].clientHeight
      renderer.setSize(that.width, that.height)
    }


    renderer = new THREE.WebGLRenderer({
      antialias: true
    })


    renderer.setPixelRatio(window.devicePixelRatio)
    resizeCanvas()

    renderer.gammaOutput = true
    renderer.gammaFactor = 2.2
    //container.appendChild( renderer.domElement ) 
    $container.append(renderer.domElement)

    scene = new THREE.Scene() 
    scene.background = new THREE.Color(0xbfe3dd) 
    camera = new THREE.PerspectiveCamera(40, that.width / that.height, 1, 1000) 
    camera.position.set(8, 6, -8) 
    controls = new OrbitControls(camera, renderer.domElement) 
    controls.target.set(0, 0.5, 0) 
    controls.enablePan = false 
    scene.add(new THREE.AmbientLight(0x404040)) 
    pointLight = new THREE.PointLight(0xffffff, 1) 
    pointLight.position.copy(camera.position) 
    scene.add(pointLight) 

    var loader = new GLTFLoader() 
    loader.load('models/gltf/qtAnimation.glb', function (gltf) {
      var model = gltf.scene 
      model.position.set(0, 0, 0) 
      model.scale.set(0.05, 0.05, 0.05) 
      scene.add(model) 
      mixer = new THREE.AnimationMixer(model) 
      console.log(gltf.animations.length)
      mixer.clipAction(gltf.animations[0]).play() 
      animate() 
    }, undefined, function (e) {
      console.error(e) 
    })

    window.onresize = function () {
      resizeCanvas()
      camera.aspect = that.width / that.height
      camera.updateProjectionMatrix()

    }

    function animate() {
      requestAnimationFrame(animate)
      var delta = clock.getDelta()
      mixer.update(delta)
      controls.update(delta)
      renderer.render(scene, camera)
    }
  }
}
</script>
