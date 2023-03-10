import { useState, useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { loadGLTFModel } from '../lib/model'
import { ObjContainer } from './obj-loader'

function easeOutCirc(x) {
  return Math.sqrt(1 - Math.pow(x - 1, 4))
}

const ThreeObj = ({ weather }) => {
  const refContainer = useRef()
  const refRenderer = useRef()
  const urlGLB = `/models3d/${weather === 'mist' ? 'clouds' : weather}.glb`

  const handleWindowResize = useCallback(() => {
    const { current: renderer } = refRenderer
    const { current: container } = refContainer
    if (container && renderer) {
      const scW = container.clientWidth
      const scH = container.clientHeight

      renderer.setSize(scW, scH)
    }
  }, [])

  const targetGLB = () => {
    switch (weather) {
      case 'clear':
        return new THREE.Vector3(0, 1, 0);
      case 'clouds':
        return new THREE.Vector3(0, 1, 2);
      case 'rain':
        return new THREE.Vector3(0, 1, 2);
      case 'snow':
        return new THREE.Vector3(0, 1, 2);
      default:
        return new THREE.Vector3(0, 1, 0);
    }
  };

  const scaleGLB = (scH) => {
    switch (weather) {
      case 'clear':
        return scH * 0.001 + 2.6
      case 'clouds':
        return scH * 0.001 + 2.8
      case 'rain':
        return scH * 0.001 + 3.4
      case 'snow':
        return scH * 0.001 + 3.4
      default:
        return scH * 0.001 + 2.3;
    }
  };


  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const { current: container } = refContainer
    if (container) {
      const scW = container.clientWidth
      const scH = container.clientHeight

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(scW, scH)
      renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild(renderer.domElement)
      refRenderer.current = renderer
      const scene = new THREE.Scene()

      const target = targetGLB()
      const initialCameraPosition = new THREE.Vector3(-90, 0, 0)

      const scale = scaleGLB(scH)
      const camera = new THREE.OrthographicCamera(
        - scale * (scW / scH), // left
        scale * (scW / scH), // right
        scale * 1.25, // top
        - scale * 1.45, // bottom
        0.01,
        50000
      )
      camera.position.copy(initialCameraPosition)
      camera.lookAt(target)

      const ambientLight = new THREE.AmbientLight(0xcccccc, 1)
      scene.add(ambientLight)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.autoRotate = true
      controls.enableZoom = false
      controls.enablePan = false
      controls.enableRotate = false
      controls.target = target

      loadGLTFModel(scene, urlGLB, {
        receiveShadow: false,
        castShadow: false
      }).then(() => {
        animate()
      })

      let req = null
      let frame = 0
      const animate = () => {
        req = requestAnimationFrame(animate)

        frame = frame <= 100 ? frame + 1 : frame

        if (frame <= 100) {
          const p = initialCameraPosition
          const rotSpeed = -easeOutCirc(frame / 120) * Math.PI * 20

          camera.position.y = 10
          camera.position.x =
            p.x * Math.cos(rotSpeed) + p.z * Math.sin(rotSpeed)
          camera.position.z =
            p.z * Math.cos(rotSpeed) - p.x * Math.sin(rotSpeed)
          camera.lookAt(target)
        } else {
          controls.update()
        }

        renderer.render(scene, camera)
      }

      return () => {
        cancelAnimationFrame(req)
        renderer.domElement.remove()
        renderer.dispose()
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize, false)
    return () => {
      window.removeEventListener('resize', handleWindowResize, false)
    }
  }, [handleWindowResize])

  return (
    <ObjContainer ref={refContainer}></ObjContainer>
  )
}

export default ThreeObj