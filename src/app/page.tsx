"use client"

  // Add imports for the info button and popups
  import { Info, Github } from 'lucide-react'
  import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "../components/ui/popover"
  import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"

import { useEffect, useMemo, useState } from "react"
import { Slider } from "../components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  byd,
  nissan,
  renault,
  skoda,
  maruti,
  hyundai,
  honda,
  tesla,
  mg,
  fiat,
  tata,
  toyota,
  kia,
  mahindra,
  volkswagon,
  bmw,
  citreon,
  volvo,
  jeep,
} from "./carmodels"
import { Delete, PinIcon, PinOff, Star, StarOff } from "lucide-react"
// groundClearance
// :
// {min: 100, max: 400}
// height
// :
// {min: 1150, max: 1937}
// length
// :
// {min: 4300, max: 5885}
// turnRadius
// :
// {min: 5.2, max: 7}
// wheelbase
// :
// {min: 2450, max: 3650}
// width
// :
// {min: 1800, max: 2070}

type CarData = {
  name: string
  yearsProduced: string
  power: string
  torque: string
  gears: string
  length: number
  width: number
  height: number
  groundClearance: number
  wheelbase: number
  turnRadius: number
  price: number
  capacity: string
  manufacturer: string
  weight: number
  estimatedCabinSpace: number
  sizeToWeightRatio: number
  dragCoefficient: number
}
function finddataspecs(data: CarData[]) {
  // List of properties for which you want min and max values
  const properties: (keyof CarData)[] = ["length", "width", "height", "turnRadius", "groundClearance", "wheelbase"]
  // Initialize an object to store the results
  type MinMax = { min: number; max: number }

  interface Stats {
    [key: string]: MinMax
  }

  const stats: Stats = {}

  // Initialize stats with the first element from data as reference (if available)
  if (data.length > 0) {
    properties.forEach((prop) => {
      stats[prop] = {
        min: data[0][prop] as number,
        max: data[0][prop] as number,
      }
    })
  }

  // Iterate over the data to compute min and max for each property
  data.forEach((item) => {
    properties.forEach((prop) => {
      const value = item[prop] as number
      if (value < stats[prop].min) {
        stats[prop].min = value
      }
      if (value > stats[prop].max) {
        stats[prop].max = value
      }
    })
  })

  console.log("Stats:", stats)
}

export default function VehicleDimensions() {
  const [dimensions, setDimensions] = useState({
    height: [1000, 2000],
    width: [1300, 3000],
    length: [2800, 6000],
    wheelbase: [2100, 5500],
    turnRadius: [3, 15],
    groundClearence: [0, 500],
  })
  const [pinnedCar, setPinnedCar] = useState<CarData | null>(null)
  const [starredCars, starcar] = useState<string[] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<
    | "name"
    | "length"
    | "width"
    | "height"
    | "price"
    | "manufacturer"
    | "groundClearance"
    | "wheelbase"
    | "turnRadius"
    | "weight"
    | "estimatedCabinSpace"
    | "sizeToWeightRatio"
    | "dragCoefficient"
  >("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("All")
  const [comparisons, setComparisons] = useState<{ field: keyof CarData; operator: ">" | "<" }[]>([])
  // const [comparisonfield, setcomparisonfield] = useState<keyof CarData | "None">("None")
  // const [comparisonFilter, setComparisonFilter] = useState<"none" | ">" | "<">("none")
  // const [showTopModal, setShowTopModal] = useState(true)

  const handleSliderChange = (value: number[], dimension: keyof typeof dimensions) => {
    setDimensions((prev) => ({
      ...prev,
      [dimension]: value,
    }))
  }

  const calculatePercentage = (value: number, reference: number): number => {
    if (!reference) return 0
    return Math.round(((value - reference) / reference) * 100)
  }
  // var data: CarData[];
  const [data, setdata] = useState([] as CarData[]);
  
  useEffect(() => {
    // This code runs only once when the component mounts
    setdata([
     ...renault,
     ...nissan,
     ...byd,
     ...skoda,
     ...maruti,
     ...hyundai,
     ...honda,
     ...tesla,
     ...mg,
     ...fiat,
     ...tata,
     ...toyota,
     ...kia,
     ...mahindra,
     ...volkswagon,
     ...bmw,
     ...citreon,
     ...volvo,
     ...jeep,
   ])
  }, []); // The empty dependency array ensures it runs only on mount

  // finddataspecs(data)
  const stats = useMemo(() => finddataspecs(data), [data]);
  stats
  const manufacturers = Array.from(new Set(data.map((car) => car.manufacturer))).sort()
  const totalCarModels = data.length
  // console.log(data)
  // Filter and sort data
  // Memoize the computation so it only recalculates when dependencies change.
  const filteredData = useMemo(() => {
    return data
      // First filtering by dimensions, search, and starred/pinned logic.
      .filter((item) => {
        if (starredCars && starredCars.includes(item.name)) return true;
        // Always include pinned car
        if (pinnedCar && item.name === pinnedCar.name) return true;

        // Filter by search query
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Filter by dimension sliders
        return (
          item.height < dimensions.height[1] &&
          item.height > dimensions.height[0] &&
          item.width < dimensions.width[1] &&
          item.width > dimensions.width[0] &&
          item.length < dimensions.length[1] &&
          item.length > dimensions.length[0] &&
          item.wheelbase < dimensions.wheelbase[1] &&
          item.wheelbase > dimensions.wheelbase[0] &&
          item.turnRadius < dimensions.turnRadius[1] &&
          item.turnRadius > dimensions.turnRadius[0] &&
          item.groundClearance < dimensions.groundClearence[1] &&
          item.groundClearance > dimensions.groundClearence[0]
        );
      })
      // Filter further by manufacturer and additional comparisons
      .filter((item) => {
        if (starredCars && starredCars.includes(item.name)) return true;
        if (pinnedCar && item.name === pinnedCar.name) return true;
        if (manufacturerFilter !== 'All' && item.manufacturer !== manufacturerFilter) return false;

        // Handle multiple comparisons when a pinned car exists.
        return comparisons.every((comparison) => {
          if (pinnedCar) {
            const carValue = item[comparison.field];
            const pinnedCarValue = pinnedCar[comparison.field];

            if (comparison.operator === '>') {
              return carValue > pinnedCarValue;
            } else if (comparison.operator === '<') {
              return carValue < pinnedCarValue;
            }
          }
          return true;
        });
      })
      // Sort the filtered results.
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return sortBy === 'name' || sortBy === 'manufacturer'
            ? a.name.localeCompare(b.name)
            : a[sortBy] - b[sortBy];
        } else {
          return sortBy === 'name' || sortBy === 'manufacturer'
            ? b.name.localeCompare(a.name)
            : b[sortBy] - a[sortBy];
        }
      });
  }, [
    data,
    starredCars,
    pinnedCar,
    searchQuery,
    dimensions,
    manufacturerFilter,
    comparisons,
    sortOrder,
    sortBy
  ]);

  // const toggleSort = (field: typeof sortBy) => {
  //   if (sortBy === field) {
  //     setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  //   } else {
  //     setSortBy(field)
  //     setSortOrder("asc")
  //   }
  // }

  const initialDimensions = useMemo(() => {return {
    height: [Math.min(...data.map((car) => car.height)), Math.max(...data.map((car) => car.height))],
    width: [Math.min(...data.map((car) => car.width)), Math.max(...data.map((car) => car.width))],
    length: [Math.min(...data.map((car) => car.length)), Math.max(...data.map((car) => car.length))],
    wheelbase: [Math.min(...data.map((car) => car.wheelbase)), Math.max(...data.map((car) => car.wheelbase))],
    turnRadius: [Math.min(...data.map((car) => car.turnRadius)), Math.max(...data.map((car) => car.turnRadius))],
    groundClearance: [
      Math.min(...data.map((car) => car.groundClearance)),
      Math.max(...data.map((car) => car.groundClearance)),
    ],
  }}, [data])

  // setDimensions(initialDimensions)
  const [showDimensionsRange, setShowDimensionsRange] = useState(true)

  return (
    <>
    <div className="flex flex-col gap-8 w-full mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">SortedCars</h1>
            <a 
              href="https://github.com/visnkmr/carproj" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>Star</span>
            </a>
          </div>
          <p>
            {filteredData.length} of {totalCarModels} vehicles found
          </p>
        </div>
      </div>
        {/* Search, Sort, and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search cars by name..."
              className="w-full px-4 py-2 border rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-2 py-1 border rounded-md"
              value={manufacturerFilter}
              onChange={(e) => setManufacturerFilter(e.target.value)}
            >
              <option value="All">All Manufacturers</option>
              {manufacturers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="px-2 py-1 border rounded-md"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            >
              <option value="name">Sort by Name</option>
              <option value="length">Sort by Length</option>
              <option value="width">Sort by Width</option>
              <option value="height">Sort by Height</option>
              <option value="price">Sort by Price</option>
              <option value="manufacturer">Sort by Manufacturer</option>
              <option value="groundClearance">Sort by Ground Clearance</option>
              <option value="wheelbase">Sort by Wheelbase</option>
              <option value="turnRadius">Sort by Turn Radius</option>
              <option value="weight">Sort by Weight</option>
              <option value="estimatedCabinSpace">Sort by Estimated Cabin Space</option>
              <option value="sizeToWeightRatio">Sort by Size to Weight Ratio</option>
              <option value="dragCoefficient">Sort by Drag Coefficient</option>
            </select>
            <button
              className="px-3 py-1 border rounded-md flex items-center gap-1"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
            </button>
          </div>
        </div>

        {/* Comparison Filter */}
        {pinnedCar && (
          <div className="flex flex-col gap-2 items-center">
            <span>Find cars with:</span>
            
  {/* Add a new comparison filter */}
  <button
    onClick={() => setComparisons([...comparisons, { field: "length", operator: ">" }])}
    className="px-2 py-1 border rounded-md"
  >
    Add Comparison
  </button>
  {/* <div className="flex flex-col gap-2"> */}
  {/* Display existing comparisons */}
  {comparisons.map((comparison, index) => (
     <div key={index} className="flex gap-2 items-center mb-2">
       <select
       className="px-2 py-1 border rounded-md"
       value={comparison.field}
       onChange={(e) =>
         setComparisons((prevComparisons) => {
           const newComparisons = [...prevComparisons];
           newComparisons[index].field = e.target.value as keyof CarData;
           return newComparisons;
         })
       }
     >
       <option value="length">Length</option>
       <option value="width">Width</option>
       <option value="height">Height</option>
       <option value="wheelbase">Wheelbase</option>
       <option value="turnRadius">Turn Radius</option>
       <option value="groundClearance">Ground Clearance</option>
       <option value="price">Price</option>
       <option value="weight">Weight</option>
       <option value="estimatedCabinSpace">Estimated Cabin Space</option>
       <option value="sizeToWeightRatio">Size to Weight Ratio</option>
       <option value="dragCoefficient">Drag Coefficient</option>
     </select>
     <select
       className="px-2 py-1 border rounded-md"
       value={comparison.operator}
       onChange={(e) =>
         setComparisons((prevComparisons) => {
           const newComparisons = [...prevComparisons];
           newComparisons[index].operator = e.target.value  as ">" | "<";
           return newComparisons;
         })
       }
     >
       <option value=">">&gt; {pinnedCar.name}</option>
       <option value="<">&lt; {pinnedCar.name}</option>
     </select>
    
     {/* Remove Comparison Button */}
     <button
       onClick={() => {
         setComparisons((prevComparisons) => prevComparisons.filter((_, i) => i !== index));
       }}
       className="px-2 py-1 bg-red-500 text-white rounded-md"
     >
       <Delete/>
     </button>
   </div>
          ))}
          {/* </div> */}
          </div>
        )}
        
        {/* Toggle for Dimensions Range */}
        <button className="px-3 py-1 border rounded-md" onClick={() => {setShowDimensionsRange(!showDimensionsRange)}}>
          {showDimensionsRange ? "Hide" : "Show"} Dimensions Range
        </button>
      {/* Dimensions Range Card */}
      {showDimensionsRange && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Vehicle Dimensions Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="height-slider" className="text-sm font-medium">
                  Height
                </label>
                <div className="flex gap-2">
                  <Badge variant="outline">Min: {dimensions.height[0]}</Badge>
                  <Badge variant="outline">Max: {dimensions.height[1]}</Badge>
                </div>
              </div>
              <Slider
                id="height-slider"
                min={initialDimensions.height[0]}
                max={initialDimensions.height[1]}
                step={100}
                value={dimensions.height}
                onValueChange={(value: number[]) => handleSliderChange(value, "height")}
                className="cursor-grab active:cursor-grabbing"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="width-slider" className="text-sm font-medium">
                  Width
                </label>
                <div className="flex gap-2">
                  <Badge variant="outline">Min: {dimensions.width[0]}</Badge>
                  <Badge variant="outline">Max: {dimensions.width[1]}</Badge>
                </div>
              </div>
              <Slider
                id="width-slider"
                min={initialDimensions.width[0]}
                max={initialDimensions.width[1]}
                step={100}
                value={dimensions.width}
                onValueChange={(value:number[]) => handleSliderChange(value, "width")}
                className="cursor-grab active:cursor-grabbing"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="length-slider" className="text-sm font-medium">
                  Length
                </label>
                <div className="flex gap-2">
                  <Badge variant="outline">Min: {dimensions.length[0]}</Badge>
                  <Badge variant="outline">Max: {dimensions.length[1]}</Badge>
                </div>
              </div>
              <Slider
                id="length-slider"
                min={initialDimensions.length[0]}
                max={initialDimensions.length[1]}
                step={100}
                value={dimensions.length}
                onValueChange={(value:number[]) => handleSliderChange(value, "length")}
                className="cursor-grab active:cursor-grabbing"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="wheelbase-slider" className="text-sm font-medium">
                  Wheelbase
                </label>
                <div className="flex gap-2">
                  <Badge variant="outline">Min: {dimensions.wheelbase[0]}</Badge>
                  <Badge variant="outline">Max: {dimensions.wheelbase[1]}</Badge>
                </div>
              </div>
              <Slider
                id="wheelbase-slider"
                min={initialDimensions.wheelbase[0]}
                max={initialDimensions.wheelbase[1]}
                step={100}
                value={dimensions.wheelbase}
                onValueChange={(value:number[]) => handleSliderChange(value, "wheelbase")}
                className="cursor-grab active:cursor-grabbing"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="turn-radius-slider" className="text-sm font-medium">
                  Turn Radius
                </label>
                <div className="flex gap-2">
                  <Badge variant="outline">Min: {dimensions.turnRadius[0]}</Badge>
                  <Badge variant="outline">Max: {dimensions.turnRadius[1]}</Badge>
                </div>
              </div>
              <Slider
                id="turn-radius-slider"
                min={initialDimensions.turnRadius[0]}
                max={initialDimensions.turnRadius[1]}
                step={0.1}
                value={dimensions.turnRadius}
                onValueChange={(value:number[]) => handleSliderChange(value, "turnRadius")}
                className="cursor-grab active:cursor-grabbing"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor="gc-slider" className="text-sm font-medium">
                  Ground clearance
                </label>
                <div className="flex gap-2">
                  <Badge variant="outline">Min: {dimensions.groundClearence[0]}</Badge>
                  <Badge variant="outline">Max: {dimensions.groundClearence[1]}</Badge>
                </div>
              </div>
              <Slider
                id="gc-slider"
                min={initialDimensions.groundClearance[0]}
                max={initialDimensions.groundClearance[1]}
                step={10}
                value={dimensions.groundClearence}
                onValueChange={(value:number[]) => handleSliderChange(value, "groundClearence")}
                className="cursor-grab active:cursor-grabbing"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Car Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
        {filteredData.map((item) => (
          <Card
            key={item.name}
            className={`${pinnedCar?.name === item.name ? "border-2 border-primary" : ""} ${
              pinnedCar?.name === item.name && !dimensions.height.includes(item.height) ? "bg-primary/5" : ""
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>
                  {item.yearsProduced}
                  <br />
                  Power: {item.power}
                  <br />
                  Torque: {item.torque}
                  <br />
                  Gears: {item.gears}
                </CardDescription>
              </div>
              <button
                onClick={() => setPinnedCar(pinnedCar?.name === item.name ? null : item)}
                className="p-2 rounded-full hover:bg-muted"
                title={pinnedCar?.name === item.name ? "Unpin this car" : "Pin this car for comparison"}
              >
                {pinnedCar?.name === item.name ? (
                  <PinIcon/>
                ) : (
                  <PinOff/>
                )}
              </button>
              <button
                onClick={() => starcar(starredCars?.includes(item.name) ? starredCars.filter((car) => car !== item.name) : [...(starredCars?starredCars:[]), item.name])}
                className="p-2 rounded-full hover:bg-muted"
                title={starredCars?.includes(item.name) ? "Unstar this car"  : "Star this car"}
              >
                {starredCars?.includes(item.name) ? (
                  <Star/>
                ) : (
                  <StarOff/>
                )}
              </button>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Price: ${item.price?.toLocaleString() || "9999"}
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.price, pinnedCar.price) > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {calculatePercentage(item.price, pinnedCar.price) > 0 ? "+" : ""}
                    {calculatePercentage(item.price, pinnedCar.price)}%
                  </Badge>
                )}
              </p>
              <p className="flex items-center gap-1">
                Length: {item.length} mm
                {/* <Dialog>
                  <DialogTrigger asChild>
                    <button className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Compare car sizes</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Size Comparison</DialogTitle>
                      <DialogDescription>
                        Visual comparison of car dimensions (excluding ground clearance)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative h-60 w-full border rounded-md p-4">
                      {pinnedCar && (
                        <div 
                          className="absolute bg-primary/20 border border-primary" 
                          style={{
                            width: `${(pinnedCar.width / 2070) * 100}%`,
                            height: `${(pinnedCar.height - pinnedCar.groundClearance) / 1937 * 100}%`,
                            bottom: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10
                          }}
                        >
                          <div className="absolute top-0 left-0 p-1 text-xs bg-primary/20 rounded">
                            {pinnedCar.name}
                          </div>
                        </div>
                      )}
                      <div 
                        className="absolute bg-secondary/20 border border-secondary" 
                        style={{
                          width: `${(item.width / 2070) * 100}%`,
                          height: `${(item.height - item.groundClearance) / 1937 * 100}%`,
                          bottom: '0',
                          left: '50%',
                          transform: 'translateX(-50%)'
                        }}
                      >
                        <div className="absolute top-0 left-0 p-1 text-xs bg-secondary/20 rounded">
                          {item.name}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div>
                        <p><strong>Current:</strong> {item.length}×{item.width}×{item.height-item.groundClearance} mm</p>
                        {pinnedCar && (
                          <p><strong>Pinned:</strong> {pinnedCar.length}×{pinnedCar.width}×{pinnedCar.height-pinnedCar.groundClearance} mm</p>
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog> */}
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.length, pinnedCar.length) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(item.length, pinnedCar.length) > 0 ? "+" : ""}
                    {calculatePercentage(item.length, pinnedCar.length)}%
                  </Badge>
                )}
              </p>
              <p>
                Width: {item.width} mm
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.width, pinnedCar.width) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(item.width, pinnedCar.width) > 0 ? "+" : ""}
                    {calculatePercentage(item.width, pinnedCar.width)}%
                  </Badge>
                )}
              </p>
              <p>
                Height: {item.height} mm
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.height, pinnedCar.height) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(item.height, pinnedCar.height) > 0 ? "+" : ""}
                    {calculatePercentage(item.height, pinnedCar.height)}%
                  </Badge>
                )}
              </p>
              <p>
                Wheelbase: {item.wheelbase} mm
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.wheelbase, pinnedCar.wheelbase) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(item.wheelbase, pinnedCar.wheelbase) > 0 ? "+" : ""}
                    {calculatePercentage(item.wheelbase, pinnedCar.wheelbase)}%
                  </Badge>
                )}
              </p>
              <p>
                Turn Radius: {item.turnRadius} m
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.turnRadius, pinnedCar.turnRadius) > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {calculatePercentage(item.turnRadius, pinnedCar.turnRadius) > 0 ? "+" : ""}
                    {calculatePercentage(item.turnRadius, pinnedCar.turnRadius)}%
                  </Badge>
                )}
              </p>
              <p>
                Ground Clearance: {item.groundClearance} mm
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.groundClearance, pinnedCar.groundClearance) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(item.groundClearance, pinnedCar.groundClearance) > 0 ? "+" : ""}
                    {calculatePercentage(item.groundClearance, pinnedCar.groundClearance)}%
                  </Badge>
                )}
              </p>
              <p>
                Weight: {item.weight} kg
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.weight, pinnedCar.weight) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(item.weight, pinnedCar.weight) > 0 ? "+" : ""}
                    {calculatePercentage(item.weight, pinnedCar.weight)}%
                  </Badge>
                )}
              </p>
              <p>Capacity: {item.capacity}</p>
              <p className="flex items-center gap-1">
                Estimated Cabin Space: {(item.estimatedCabinSpace/1000000000).toPrecision(2)} m^3
                {/* <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">What is Estimated Cabin Space?</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Estimated Cabin Space</h4>
                      <p className="text-sm text-muted-foreground">
                        This is an approximation of the interior volume available for passengers. 
                        Its calculated based on the vehicles dimensions and represents the usable 
                        space inside the cabin in cubic meters (m³).
                      </p>
                    </div>
                  </PopoverContent>
                </Popover> */}
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.estimatedCabinSpace, pinnedCar.estimatedCabinSpace) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(item.estimatedCabinSpace, pinnedCar.estimatedCabinSpace) > 0 ? "+" : ""}
                    {calculatePercentage(item.estimatedCabinSpace, pinnedCar.estimatedCabinSpace)}%
                  </Badge>
                )}
              </p>
              <p className="flex items-center gap-1">
                Drag Coefficient: {item.dragCoefficient}
                {/* <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">What is Drag Coefficient?</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Drag Coefficient</h4>
                      <p className="text-sm text-muted-foreground">
                        The drag coefficient is a dimensionless quantity that indicates how aerodynamic a vehicle is. 
                        A lower value means less air resistance, which typically results in better fuel efficiency 
                        and higher top speeds. Most modern cars have drag coefficients between 0.25 and 0.35.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover> */}
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(item.dragCoefficient, pinnedCar.dragCoefficient) > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                  >
                    {calculatePercentage(item.dragCoefficient, pinnedCar.dragCoefficient) > 0 ? "+" : ""}
                    {calculatePercentage(item.dragCoefficient, pinnedCar.dragCoefficient)}%
                  </Badge>
                )}
              </p>
              <p className="flex items-center gap-1">
                Size to Weight Ratio: {((1/item.sizeToWeightRatio)*1000000).toPrecision(2)}
                {/* <Popover>
                  <PopoverTrigger asChild>
                    <button className="inline-flex">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">What is Size to Weight Ratio?</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-medium">Size to Weight Ratio</h4>
                      <p className="text-sm text-muted-foreground">
                        This metric indicates how efficiently a vehicle uses its weight relative to its size. 
                        A higher value suggests better material efficiency and potentially better fuel economy. 
                        Its calculated by dividing the vehicles interior volume by its weight.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover> */}
                {pinnedCar && pinnedCar.name !== item.name && (
                  <Badge
                    className={`ml-2 ${calculatePercentage(1/item.sizeToWeightRatio, 1/pinnedCar.sizeToWeightRatio) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {calculatePercentage(1/item.sizeToWeightRatio, 1/pinnedCar.sizeToWeightRatio) > 0 ? "+" : ""}
                    {calculatePercentage(1/item.sizeToWeightRatio, 1/pinnedCar.sizeToWeightRatio)}%
                  </Badge>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <a
            href="https://github.com/visnkmr/carproj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            Source code availble @ GitHub
          </a>
          {/* <a
            href="https://telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            Telegram
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            Twitter
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700"
          >
            LinkedIn
          </a> */}
        </div>

        <p>Submit new Cars as PR on GitHub. Thanks.</p>
        <p className="italic text-xs leading-relaxed p-4 text-black">
  Disclaimer: The information provided on this website regarding car specifications, features, and other related details is for general informational purposes only. While we strive to ensure the accuracy and completeness of the information, the specifications, features, and details listed are subject to change by the manufacturers without notice.

  We do not guarantee the accuracy, reliability, or completeness of the information provided on this site. Car specifications and features may vary by region, model year, and other factors. Always verify any critical vehicle details with the car manufacturer or an authorized dealership before making purchasing decisions.

  We are not liable for any errors, omissions, or discrepancies in the information provided. By using this website, you agree that we are not responsible for any direct, indirect, incidental, or consequential damages arising from the use of the information provided.
</p>
      </footer>
    </div>
  </>
  )
}

