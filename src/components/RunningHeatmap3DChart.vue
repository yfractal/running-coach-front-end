<template>
  <div class="w-full h-full bg-white p-1">
    <div class="flex items-center justify-between mb-1">
      <h3 class="text-lg font-medium text-gray-900">3D Running Distance Activity</h3>
      <div class="flex items-center gap-4">
        <span class="text-sm text-gray-600">Total: {{ totalDistance }} km</span>
        <button 
          @click="resetCamera"
          class="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Reset View
        </button>
      </div>
    </div>
    
    <div class="relative w-full h-[calc(100%-4rem)] bg-emerald-50 rounded-lg overflow-hidden">
      <canvas 
        ref="canvas" 
        class="w-full h-full cursor-grab active:cursor-grabbing"
        @mousedown="isDragging = true"
        @mouseup="isDragging = false"
        @mouseleave="isDragging = false; hideTooltip()"
        @mousemove="onMouseMove"
      ></canvas>
      
      <!-- Custom Tooltip -->
      <div
        v-if="tooltip.show"
        class="absolute bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none z-10"
        :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        {{ tooltip.text }}
      </div>
    </div>
    
         <!-- Legend -->
     <div class="flex items-center justify-end gap-2 mt-1">
       <span class="text-gray-600 text-xs">Less</span>
       <div class="flex gap-1">
         <div class="w-3 h-3 rounded-sm border border-gray-200" style="background-color: #b8b9c0;"></div>
         <div class="w-3 h-3 rounded-sm border border-gray-200" style="background-color: #a7f3d0;"></div>
         <div class="w-3 h-3 rounded-sm border border-gray-200" style="background-color: #6ee7b7;"></div>
         <div class="w-3 h-3 rounded-sm border border-gray-200" style="background-color: #34d399;"></div>
         <div class="w-3 h-3 rounded-sm border border-gray-200" style="background-color: #10b981;"></div>
       </div>
       <span class="text-gray-600 text-xs">More</span>
     </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  yearlyRunningData: {
    type: Object,
    required: true
  }
})

const canvas = ref(null)
const isDragging = ref(false)
let scene, camera, renderer, raycaster, mouse, controls
let cubes = []
let animationId = null

// Tooltip state
const tooltip = reactive({
  show: false,
  x: 0,
  y: 0,
  text: ''
})

// Convert meters to kilometers
const metersToKm = (meters) => {
  return Math.round((meters / 1000) * 100) / 100
}

// Calculate total distance
const totalDistance = computed(() => {
  const total = Object.values(props.yearlyRunningData).reduce((sum, data) => {
    return sum + (data.value || 0)
  }, 0)
  return metersToKm(total)
})

// Get intensity level and color
const getIntensityData = (distance) => {
  if (!distance || distance === 0) {
    return { level: 0, color: 0xb8b9c0, height: 0.1 } // cool gray
  }
  
  const km = metersToKm(distance)
  if (km < 2) return { level: 1, color: 0xa7f3d0, height: 1.2 } // light teal
  if (km < 4) return { level: 2, color: 0x6ee7b7, height: 2.4 } // medium teal
  if (km < 6) return { level: 3, color: 0x34d399, height: 3.6 } // darker teal
  return { level: 4, color: 0x10b981, height: 4.8 } // darkest teal
}

// Generate calendar data
const generateCalendarData = () => {
  const currentYear = new Date().getFullYear()
  const startDate = new Date(currentYear, 0, 1)
  const endDate = new Date(currentYear, 11, 31)
  
  const weeks = []
  const current = new Date(startDate)
  
  // Move to the first Sunday
  current.setDate(current.getDate() - current.getDay())
  
  while (current <= endDate || weeks.length < 53) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const dateStr = current.toISOString().split('T')[0]
      const data = props.yearlyRunningData[dateStr]
      const intensityData = getIntensityData(data?.value || 0)
      
      week.push({
        date: dateStr,
        distance: data?.value || 0,
        ...intensityData,
        isCurrentYear: current.getFullYear() === currentYear
      })
      
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
    
    if (weeks.length > 54) break
  }
  
  return weeks
}

// Initialize Three.js scene
const initThreeJS = () => {
  if (!canvas.value) return
  
  const rect = canvas.value.getBoundingClientRect()
  
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0fdf4) // cool mint background
  
  // Camera
  camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000)
  camera.position.set(55, 45, 55)
  camera.lookAt(0, 0, 0)
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ 
    canvas: canvas.value,
    antialias: true
  })
  renderer.setSize(rect.width, rect.height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x506570, 0.6) // cool ambient light
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(10, 10, 5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)
  
  // Add a subtle blue rim light for extra coolness
  const rimLight = new THREE.DirectionalLight(0x64b5f6, 0.3)
  rimLight.position.set(-10, 5, -10)
  scene.add(rimLight)
  
  // Raycaster for mouse interaction
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  
  // Create cubes
  createCubes()
  
  // Start animation loop
  animate()
}

// Create cubes for each day
const createCubes = () => {
  const calendarData = generateCalendarData()
  cubes = []
  
  const cubeSize = 1.5
  const spacing = 1.8
  
  calendarData.forEach((week, weekIndex) => {
    week.forEach((day, dayIndex) => {
      if (!day.isCurrentYear) return
      
      const geometry = new THREE.BoxGeometry(cubeSize, day.height, cubeSize)
      const material = new THREE.MeshLambertMaterial({ 
        color: day.color,
        transparent: true,
        opacity: 0.9
      })
      
      const cube = new THREE.Mesh(geometry, material)
      cube.position.set(
        (weekIndex - 26) * spacing, // Center around 0
        day.height / 2,
        (dayIndex - 3) * spacing // Center around 0
      )
      
      cube.castShadow = true
      cube.receiveShadow = true
      
      // Store data for interaction
      cube.userData = {
        date: day.date,
        distance: day.distance,
        originalHeight: day.height,
        originalColor: day.color
      }
      
      scene.add(cube)
      cubes.push(cube)
    })
  })
}

// Mouse move handler
const onMouseMove = (event) => {
  if (!canvas.value) return
  
  const rect = canvas.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  // Handle camera rotation
  if (isDragging.value) {
    const deltaX = event.movementX * 0.01
    const deltaY = event.movementY * 0.01
    
    // Rotate camera around the center
    const spherical = new THREE.Spherical()
    spherical.setFromVector3(camera.position)
    spherical.theta -= deltaX
    spherical.phi += deltaY
    spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
    
    camera.position.setFromSpherical(spherical)
    camera.lookAt(0, 0, 0)
  } else {
    // Handle hover
    handleHover(event)
  }
}

// Handle hover interaction
const handleHover = (event) => {
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(cubes)
  
  // Reset all cubes
  cubes.forEach(cube => {
    cube.scale.set(1, 1, 1)
    cube.material.emissive.setHex(0x000000)
  })
  
  if (intersects.length > 0) {
    const cube = intersects[0].object
    const userData = cube.userData
    
    // Highlight hovered cube
    cube.scale.set(1.1, 1.1, 1.1)
    cube.material.emissive.setHex(0x444444)
    
    // Show tooltip
    const rect = canvas.value.getBoundingClientRect()
    tooltip.text = `${new Date(userData.date).toLocaleDateString()}: ${userData.distance ? metersToKm(userData.distance) + ' km' : 'No running data'}`
    tooltip.x = event.clientX - rect.left + 10
    tooltip.y = event.clientY - rect.top - 30
    tooltip.show = true
  } else {
    hideTooltip()
  }
}

// Hide tooltip
const hideTooltip = () => {
  tooltip.show = false
}

// Reset camera position
const resetCamera = () => {
  camera.position.set(55, 45, 55)
  camera.lookAt(0, 0, 0)
}

// Animation loop
const animate = () => {
  animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

// Handle window resize
const handleResize = () => {
  if (!canvas.value || !camera || !renderer) return
  
  const rect = canvas.value.getBoundingClientRect()
  camera.aspect = rect.width / rect.height
  camera.updateProjectionMatrix()
  renderer.setSize(rect.width, rect.height)
}

// Lifecycle hooks
onMounted(() => {
  initThreeJS()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
  
  // Clean up Three.js objects
  if (renderer) {
    renderer.dispose()
  }
  if (scene) {
    scene.clear()
  }
})
</script>

<style scoped>
canvas {
  display: block;
}
</style> 