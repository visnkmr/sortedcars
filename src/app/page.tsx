"use client"

// 1. Import necessary hooks for optimization
import { useState, useMemo, useCallback, memo} from "react"

// Add imports for the info button and popups
import { Github } from "lucide-react"


import { Slider } from "../components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
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
  volkswagen,
  bmw,
  citroen,
  volvo,
  jeep,
  vinfast,
} from "./carmodels"
import { Delete, PinIcon, PinOff, Star, StarOff } from "lucide-react"
import SizeComparisonDialog from "./size-comparison-dialog"
import { InfoPopover } from "./info-components"
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

export type CarData = {
  name: string
  yearsProduced: string
  power: number | number[]
  torque?: number | number[]
  gears: string
  length: number
  width: number
  height: number
  groundClearance: number
  wheelbase: number
  turnRadius: number
  price: number
  capacity?: number | number[]
  manufacturer: string
  weight: number
  estimatedCabinSpace: number
  sizeToWeightRatio: number
  dragCoefficient: number
}

function getComparableValue(value: number | number[] | undefined): number {
  if (value === undefined) return 0
  return Array.isArray(value) ? Math.max(...value) : value
}

function formatValue(value: number | number[] | undefined): string {
  if (value === undefined) return "N/A"
  return Array.isArray(value) ? value.join(" - ") : String(value)
}

function formatCapacity(value: number | number[] | undefined): string {
  if (value === undefined) return "N/A"
  if (Array.isArray(value)) {
    return value.map(v => `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)} kWh`).join(" - ")
  }
  return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)} kWh`
}

// 17. Move the finddataspecs function outside the component
function finddataspecs(data: CarData[]) {
  // Only run this in development mode
  if (process.env.NODE_ENV !== "production") {
    // List of properties for which you want min and max values
    const properties: (keyof CarData)[] = ["length", "width", "height", "turnRadius", "groundClearance", "wheelbase", "power", "torque", "capacity"]
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
        const raw = item[prop]
        const value = typeof raw === 'number' ? raw : (typeof raw === 'string' ? 0 : getComparableValue(raw))
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
}

// 3. Create a memoized CarCard component to prevent unnecessary re-renders
type carcardprops = {
  item: CarData,
  pinnedCar: CarData | null,
  setPinnedCar: React.Dispatch<React.SetStateAction<CarData | null>>,
  starredCars: string[]|null,
  starcar: React.Dispatch<React.SetStateAction<string[]|null>>,
}
// eslint-disable-next-line react/display-name
const CarCard = memo(({ item, pinnedCar, setPinnedCar, starredCars, starcar }:carcardprops) => {
  // Move the percentage calculation inside the memoized component
  const calculatePercentage = useCallback((value: number, reference: number) => {
    if (!reference) return 0
    return Math.round(((value - reference) / reference) * 100)
  }, [])

  return (
    <Card
      className={`${pinnedCar?.name === item.name ? "border-2 border-primary" : ""} ${
        pinnedCar?.name === item.name ? "bg-primary/5" : ""
      }`}
    >
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{item.name}</CardTitle>
          <CardDescription>
            {item.yearsProduced}
            <br />
            Gears: {item.gears}
          </CardDescription>
        </div>
        <button
          onClick={() => setPinnedCar(pinnedCar?.name === item.name ? null : item)}
          className="p-2 rounded-full hover:bg-muted"
          title={pinnedCar?.name === item.name ? "Unpin this car" : "Pin this car for comparison"}
        >
          {pinnedCar?.name === item.name ? <PinIcon /> : <PinOff />}
        </button>
        <button
          onClick={() =>
            starcar(
              starredCars?.includes(item.name)
                ? starredCars.filter((car) => car !== item.name)
                : [...(starredCars ? starredCars : []), item.name],
            )
          }
          className="p-2 rounded-full hover:bg-muted"
          title={starredCars?.includes(item.name) ? "Unstar this car" : "Star this car"}
        >
          {starredCars?.includes(item.name) ? <Star /> : <StarOff />}
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
          Power: {formatValue(item.power)} bhp
          {pinnedCar && pinnedCar.name !== item.name && (
            <Badge
              className={`ml-2 ${getComparableValue(item.power) > getComparableValue(pinnedCar.power) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {calculatePercentage(getComparableValue(item.power), getComparableValue(pinnedCar.power)) > 0 ? "+" : ""}
              {calculatePercentage(getComparableValue(item.power), getComparableValue(pinnedCar.power))}%
            </Badge>
          )}
        </p>
        <p className="flex items-center gap-1">
          Torque: {formatValue(item.torque)} Nm
          {pinnedCar && pinnedCar.name !== item.name && (
            <Badge
              className={`ml-2 ${getComparableValue(item.torque) > getComparableValue(pinnedCar.torque) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {calculatePercentage(getComparableValue(item.torque), getComparableValue(pinnedCar.torque)) > 0 ? "+" : ""}
              {calculatePercentage(getComparableValue(item.torque), getComparableValue(pinnedCar.torque))}%
            </Badge>
          )}
        </p>
        <p className="flex items-center gap-1">
          Length: {item.length} mm
          <SizeComparisonDialog item={item} pinnedCar={pinnedCar}/>
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
        <p className="flex items-center gap-1">
          Capacity: {formatCapacity(item.capacity)}
          {pinnedCar && pinnedCar.name !== item.name && (
            <Badge
              className={`ml-2 ${getComparableValue(item.capacity) > getComparableValue(pinnedCar.capacity) ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {calculatePercentage(getComparableValue(item.capacity), getComparableValue(pinnedCar.capacity)) > 0 ? "+" : ""}
              {calculatePercentage(getComparableValue(item.capacity), getComparableValue(pinnedCar.capacity))}%
            </Badge>
          )}
        </p>
        <p className="flex items-center gap-1">
          Estimated Cabin Space: {(item.estimatedCabinSpace / 1000000000).toPrecision(2)} m^3
          <InfoPopover title="Estimated Cabin Space" srText="What is Estimated Cabin Space?" text={` This is an approximation of the interior volume available for passengers. 
                        Its calculated based on the vehicles dimensions and represents the usable 
                        space inside the cabin in cubic meters (m³).`}/>
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
          <InfoPopover title="Drag Coefficient" srText="What is Drag Coefficient?" text={`The drag coefficient is a dimensionless quantity that indicates how aerodynamic a vehicle is. 
                        A lower value means less air resistance, which typically results in better fuel efficiency 
                        and higher top speeds. Most modern cars have drag coefficients between 0.25 and 0.35.`}/>
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
          Size to Weight Ratio: {((1 / item.sizeToWeightRatio) * 1000000).toPrecision(2)} 
          <InfoPopover title="Size to weight Ratio" srText="What is Size to Weight Ratio?" text="This metric indicates how efficiently a vehicle uses its weight relative to its size. 
                        A higher value suggests more metal per cubic meter. 
                        Its calculated by dividing the vehicles interior volume by its weight."/>
          {pinnedCar && pinnedCar.name !== item.name && (
            <Badge
              className={`ml-2 ${calculatePercentage(1 / item.sizeToWeightRatio, 1 / pinnedCar.sizeToWeightRatio) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {calculatePercentage(1 / item.sizeToWeightRatio, 1 / pinnedCar.sizeToWeightRatio) > 0 ? "+" : ""}
              {calculatePercentage(1 / item.sizeToWeightRatio, 1 / pinnedCar.sizeToWeightRatio)}%
            </Badge>
          )}
        </p>
      </CardContent>
    </Card>
  )
})

// 4. Replace the main component with optimized version
export default function VehicleDimensions() {
  // 5. Move finddataspecs outside the component to prevent recalculation on every render
  const [dimensions, setDimensions] = useState({
    height: [1000, 2000],
    width: [1300, 3000],
    length: [2800, 6000],
    wheelbase: [2100, 5500],
    turnRadius: [3, 15],
    groundClearence: [0, 500],
    power: [0, 1100],
    torque: [0, 750],
    capacity: [0, 130000],
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
    | "power"
    | "torque"
    | "capacity"
  >("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [manufacturerFilter, setManufacturerFilter] = useState<string>("All")
  const [comparisons, setComparisons] = useState<{ field: keyof CarData; operator: ">" | "<" }[]>([])
  const [showDimensionsRange, setShowDimensionsRange] = useState(true)

  // 6. Memoize the combined data array to prevent recreation on every render
  const data = useMemo(
    () => [
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
      ...volkswagen,
      ...bmw,
      ...citroen,
      ...volvo,
      ...jeep,
      ...vinfast,
    ] as CarData[],
    [],
  )

  // 7. Memoize manufacturers list
  const manufacturers = useMemo(() => Array.from(new Set(data.map((car) => car.manufacturer))).sort(), [data])

  // 8. Memoize total car models count
  const totalCarModels = useMemo(() => data.length, [data])

  // 9. Memoize initial dimensions to prevent recalculation
  const initialDimensions = useMemo(
    () => ({
      height: [Math.min(...data.map((car) => car.height)), Math.max(...data.map((car) => car.height))],
      width: [Math.min(...data.map((car) => car.width)), Math.max(...data.map((car) => car.width))],
      length: [Math.min(...data.map((car) => car.length)), Math.max(...data.map((car) => car.length))],
      wheelbase: [Math.min(...data.map((car) => car.wheelbase)), Math.max(...data.map((car) => car.wheelbase))],
      turnRadius: [Math.min(...data.map((car) => car.turnRadius)), Math.max(...data.map((car) => car.turnRadius))],
      groundClearance: [
        Math.min(...data.map((car) => car.groundClearance)),
        Math.max(...data.map((car) => car.groundClearance)),
      ],
      power: [
        Math.min(...data.map((car) => getComparableValue(car.power))),
        Math.max(...data.map((car) => getComparableValue(car.power))),
      ],
      torque: (() => {
        const vals = data.map((car) => car.torque).filter((v): v is number | number[] => v !== undefined).map(getComparableValue)
        return vals.length > 0 ? [Math.min(...vals), Math.max(...vals)] : [0, 0]
      })(),
      capacity: (() => {
        const vals = data.map((car) => car.capacity).filter((v): v is number | number[] => v !== undefined).map(getComparableValue)
        return vals.length > 0 ? [Math.min(...vals), Math.max(...vals)] : [0, 0]
      })(),
    }),
    [data],
  )

  // 10. Memoize the filtered data to prevent recalculation on every render
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        if (starredCars && starredCars?.includes(item.name)) return true
        if (pinnedCar && item.name === pinnedCar.name) return true
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

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
          item.groundClearance > dimensions.groundClearence[0] &&
          getComparableValue(item.power) < dimensions.power[1] &&
          getComparableValue(item.power) > dimensions.power[0] &&
          (item.torque === undefined || (getComparableValue(item.torque) < dimensions.torque[1] && getComparableValue(item.torque) > dimensions.torque[0])) &&
          (item.capacity === undefined || (getComparableValue(item.capacity) < dimensions.capacity[1] && getComparableValue(item.capacity) > dimensions.capacity[0]))
        )
      })
      .filter((item) => {
        if (starredCars && starredCars?.includes(item.name)) return true
        if (pinnedCar && item.name === pinnedCar.name) return true
        if (manufacturerFilter !== "All" && item.manufacturer !== manufacturerFilter) return false

        return comparisons.every((comparison) => {
          if (pinnedCar) {
            const carValue = getComparableValue(item[comparison.field] as number | number[])
            const pinnedCarValue = getComparableValue(pinnedCar[comparison.field] as number | number[])

            if (comparison.operator === ">") {
              return carValue > pinnedCarValue
            } else if (comparison.operator === "<") {
              return carValue < pinnedCarValue
            }
          }
          return true
        })
      })
      .sort((a, b) => {
        const aVal = sortBy === "name" || sortBy === "manufacturer" ? 0 : getComparableValue(a[sortBy] as number | number[])
        const bVal = sortBy === "name" || sortBy === "manufacturer" ? 0 : getComparableValue(b[sortBy] as number | number[])
        if (sortOrder === "asc") {
          return sortBy === "name" || sortBy === "manufacturer"
            ? a.name.localeCompare(b.name)
            : aVal - bVal
        } else {
          return sortBy === "name" || sortBy === "manufacturer"
            ? b.name.localeCompare(a.name)
            : bVal - aVal
        }
      })
  }, [data, dimensions, searchQuery, manufacturerFilter, comparisons, pinnedCar, starredCars, sortBy, sortOrder])

  // 11. Use useCallback for event handlers to prevent recreation on every render
  const handleSliderChange = useCallback((value: number[], dimension: keyof typeof dimensions) => {
    setDimensions((prev) => ({
      ...prev,
      [dimension]: value,
    }))
  }, [])

  // 12. Use useCallback for the toggle dimensions function
  const toggleDimensionsRange = useCallback(() => {
    setShowDimensionsRange(!showDimensionsRange)
  }, [showDimensionsRange])

  // 13. Use useCallback for the add comparison function
  const addComparison = useCallback(() => {
    setComparisons([...comparisons, { field: "length", operator: ">" }])
  }, [comparisons])

  // 14. Use useCallback for the remove comparison function
  const removeComparison = useCallback((index: number) => {
    setComparisons((prevComparisons) => prevComparisons.filter((_, i) => i !== index))
  }, [])

  // 15. Use useCallback for the update comparison function
  const updateComparison = useCallback((index: number, field: keyof CarData, operator: ">" | "<") => {
    setComparisons((prevComparisons) => {
      const newComparisons = [...prevComparisons]
      newComparisons[index] = { field, operator }
      return newComparisons
    })
  }, [])

  finddataspecs(data)

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
                <option value="power">Sort by Power</option>
                <option value="torque">Sort by Torque</option>
                <option value="capacity">Sort by Capacity</option>
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
              <button onClick={addComparison} className="px-2 py-1 border rounded-md">
                Add Comparison
              </button>

              {/* Display existing comparisons */}
              {comparisons.map((comparison, index) => (
                <div key={index} className="flex gap-2 items-center mb-2">
                  <select
                    className="px-2 py-1 border rounded-md"
                    value={comparison.field}
                    onChange={(e) => updateComparison(index, e.target.value as keyof CarData, comparison.operator)}
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
                    <option value="power">Power</option>
                    <option value="torque">Torque</option>
                    <option value="capacity">Capacity</option>
                  </select>
                  <select
                    className="px-2 py-1 border rounded-md"
                    value={comparison.operator}
                    onChange={(e) => updateComparison(index, comparison.field, e.target.value as ">" | "<")}
                  >
                    <option value=">">&gt; {pinnedCar.name}</option>
                    <option value="<">&lt; {pinnedCar.name}</option>
                  </select>

                  {/* Remove Comparison Button */}
                  <button
                    onClick={() => removeComparison(index)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md"
                  >
                    <Delete />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Toggle for Dimensions Range */}
          <button className="px-3 py-1 border rounded-md" onClick={toggleDimensionsRange}>
            {showDimensionsRange ? "Hide" : "Show"} Dimensions Range
          </button>
        </div>

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
                  onValueChange={(value: number[]) => handleSliderChange(value, "width")}
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
                  onValueChange={(value: number[]) => handleSliderChange(value, "length")}
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
                  onValueChange={(value: number[]) => handleSliderChange(value, "wheelbase")}
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
                  onValueChange={(value: number[]) => handleSliderChange(value, "turnRadius")}
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
                  onValueChange={(value: number[]) => handleSliderChange(value, "groundClearence")}
                  className="cursor-grab active:cursor-grabbing"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="power-slider" className="text-sm font-medium">
                    Power (bhp)
                  </label>
                  <div className="flex gap-2">
                    <Badge variant="outline">Min: {dimensions.power[0]}</Badge>
                    <Badge variant="outline">Max: {dimensions.power[1]}</Badge>
                  </div>
                </div>
                <Slider
                  id="power-slider"
                  min={initialDimensions.power[0]}
                  max={initialDimensions.power[1]}
                  step={10}
                  value={dimensions.power}
                  onValueChange={(value: number[]) => handleSliderChange(value, "power")}
                  className="cursor-grab active:cursor-grabbing"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="torque-slider" className="text-sm font-medium">
                    Torque (Nm)
                  </label>
                  <div className="flex gap-2">
                    <Badge variant="outline">Min: {dimensions.torque[0]}</Badge>
                    <Badge variant="outline">Max: {dimensions.torque[1]}</Badge>
                  </div>
                </div>
                <Slider
                  id="torque-slider"
                  min={initialDimensions.torque[0]}
                  max={initialDimensions.torque[1]}
                  step={10}
                  value={dimensions.torque}
                  onValueChange={(value: number[]) => handleSliderChange(value, "torque")}
                  className="cursor-grab active:cursor-grabbing"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="capacity-slider" className="text-sm font-medium">
                    Capacity (kWh)
                  </label>
                  <div className="flex gap-2">
                    <Badge variant="outline">Min: {(dimensions.capacity[0] / 1000).toFixed(0)}</Badge>
                    <Badge variant="outline">Max: {(dimensions.capacity[1] / 1000).toFixed(0)}</Badge>
                  </div>
                </div>
                <Slider
                  id="capacity-slider"
                  min={initialDimensions.capacity[0]}
                  max={initialDimensions.capacity[1]}
                  step={1000}
                  value={dimensions.capacity}
                  onValueChange={(value: number[]) => handleSliderChange(value, "capacity")}
                  className="cursor-grab active:cursor-grabbing"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Car Grid - Use windowing for better performance with large lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8 gap-4">
          {/* 16. Use the memoized CarCard component for each car */}
          {filteredData.slice(0, 100).map((item) => (
            <CarCard
              key={item.name}
              item={item}
              pinnedCar={pinnedCar}
              setPinnedCar={setPinnedCar}
              starredCars={starredCars}
              starcar={starcar}
            />
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
          </div>

          <p>Submit new Cars as PR on GitHub. Thanks.</p>
          <p className="italic text-xs leading-relaxed p-4 text-black">
            Disclaimer: The information provided on this website regarding car specifications, features, and other
            related details is for general informational purposes only. While we strive to ensure the accuracy and
            completeness of the information, the specifications, features, and details listed are subject to change by
            the manufacturers without notice. We do not guarantee the accuracy, reliability, or completeness of the
            information provided on this site. Car specifications and features may vary by region, model year, and other
            factors. Always verify any critical vehicle details with the car manufacturer or an authorized dealership
            before making purchasing decisions. We are not liable for any errors, omissions, or discrepancies in the
            information provided. By using this website, you agree that we are not responsible for any direct, indirect,
            incidental, or consequential damages arising from the use of the information provided.
          </p>
        </footer>
      </div>
    </>
  )
}

