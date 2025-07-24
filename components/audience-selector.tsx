"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Target, Database, RefreshCw, AlertCircle } from "lucide-react"
import { audienceApi, apiWithFallback, demoData } from "@/lib/api"
import { useApi } from "@/hooks/useApi"

interface AudienceData {
  ageGroups: string[]
  genders: string[]
  locations: string[]
  industries: string[]
  targetCount: number
  dataSource: string
}

interface AudienceSelectorProps {
  audience: AudienceData
  onAudienceUpdate: (audience: AudienceData) => void
}

const ageGroupOptions = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"]

export default function AudienceSelector({ audience, onAudienceUpdate }: AudienceSelectorProps) {
  const [customTarget, setCustomTarget] = useState(audience.targetCount.toString())

  // Fetch audience statistics from API
  const {
    data: audienceStats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useApi(() => apiWithFallback(() => audienceApi.getAudienceStats(), demoData.audienceStats))

  const stats = audienceStats || demoData.audienceStats

  // Calculate estimated reach based on selected criteria
  const calculateEstimatedReach = () => {
    if (!stats) return 0

    let estimatedReach = 0

    // Calculate based on age groups
    if (audience.ageGroups.length > 0) {
      const ageReach = audience.ageGroups.reduce((sum, ageGroup) => {
        return sum + (stats.byAgeGroup[ageGroup] || 0)
      }, 0)
      estimatedReach = Math.max(estimatedReach, ageReach)
    }

    // Calculate based on industries
    if (audience.industries.length > 0) {
      const industryReach = audience.industries.reduce((sum, industry) => {
        return sum + (stats.byIndustry[industry] || 0)
      }, 0)
      estimatedReach = Math.max(estimatedReach, industryReach)
    }

    // Calculate based on locations (countries)
    if (audience.locations.length > 0) {
      const locationReach = audience.locations.reduce((sum, location) => {
        return sum + (stats.byCountry[location] || 0)
      }, 0)
      estimatedReach = Math.max(estimatedReach, locationReach)
    }

    // If no specific criteria selected, use total active audience
    if (audience.ageGroups.length === 0 && audience.industries.length === 0 && audience.locations.length === 0) {
      estimatedReach = stats.active
    }

    // Apply intersection logic for more accurate estimation
    if (audience.ageGroups.length > 0 && audience.industries.length > 0) {
      // Rough estimation: reduce by 30% for intersection
      estimatedReach = Math.floor(estimatedReach * 0.7)
    }

    return Math.min(estimatedReach, stats.total)
  }

  const estimatedReach = calculateEstimatedReach()

  const handleMultiSelect = (field: keyof AudienceData, value: string) => {
    const currentValues = audience[field] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    onAudienceUpdate({
      ...audience,
      [field]: newValues,
    })
  }

  const handleTargetCountChange = (value: string) => {
    setCustomTarget(value)
    const numValue = Number.parseInt(value) || 0
    onAudienceUpdate({
      ...audience,
      targetCount: numValue,
    })
  }

  const getAvailableOptions = (type: "locations" | "industries") => {
    if (!stats) return []

    if (type === "locations") {
      return Object.keys(stats.byCountry)
    } else {
      return Object.keys(stats.byIndustry)
    }
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Define Target Audience</h2>
        <p className="text-slate-500">Select criteria to target specific audience segments for your survey</p>
      </div>

      {/* Error Display */}
      {statsError && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <div className="flex-1">
            <p className="text-yellow-800 text-sm">
              ⚠️ Unable to load live audience data. Using demo data for calculations.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refetchStats} disabled={statsLoading}>
            <RefreshCw className={`h-4 w-4 ${statsLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Audience Criteria */}
        <div className="lg:col-span-2 space-y-4">
          {/* Age Groups */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Age Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {ageGroupOptions.map((ageGroup) => (
                  <Button
                    key={ageGroup}
                    variant={audience.ageGroups.includes(ageGroup) ? "default" : "outline"}
                    className="justify-start h-auto p-3 text-left"
                    onClick={() => handleMultiSelect("ageGroups", ageGroup)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{ageGroup}</div>
                      <div className="text-xs opacity-70">
                        {statsLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          `${(stats?.byAgeGroup[ageGroup] || 0).toLocaleString()} people`
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gender */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Gender</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {genderOptions.map((gender) => (
                  <Button
                    key={gender}
                    variant={audience.genders.includes(gender) ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => handleMultiSelect("genders", gender)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{gender}</div>
                      <div className="text-xs opacity-70">
                        {statsLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          `${(stats?.byGender[gender] || 0).toLocaleString()} people`
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {getAvailableOptions("locations").map((location) => (
                  <Button
                    key={location}
                    variant={audience.locations.includes(location) ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => handleMultiSelect("locations", location)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{location}</div>
                      <div className="text-xs opacity-70">
                        {statsLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          `${(stats?.byCountry[location] || 0).toLocaleString()} people`
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industries */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Industries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {getAvailableOptions("industries").map((industry) => (
                  <Button
                    key={industry}
                    variant={audience.industries.includes(industry) ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => handleMultiSelect("industries", industry)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{industry}</div>
                      <div className="text-xs opacity-70">
                        {statsLoading ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          `${(stats?.byIndustry[industry] || 0).toLocaleString()} people`
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Target */}
        <div className="space-y-6">
          {/* Audience Summary */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Audience Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Age Groups</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {audience.ageGroups.length > 0 ? (
                      audience.ageGroups.map((age) => (
                        <Badge key={age} variant="secondary" className="text-xs">
                          {age}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">All ages</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600">Gender</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {audience.genders.length > 0 ? (
                      audience.genders.map((gender) => (
                        <Badge key={gender} variant="secondary" className="text-xs">
                          {gender}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">All genders</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600">Locations</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {audience.locations.length > 0 ? (
                      audience.locations.map((location) => (
                        <Badge key={location} variant="secondary" className="text-xs">
                          {location}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">All locations</span>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600">Industries</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {audience.industries.length > 0 ? (
                      audience.industries.map((industry) => (
                        <Badge key={industry} variant="secondary" className="text-xs">
                          {industry}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">All industries</span>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Estimated Reach</span>
                  <span className="text-lg font-bold text-violet-600">
                    {statsLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : estimatedReach.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Based on current audience database
                  {!statsLoading && statsError && " (demo data)"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Target Count */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Survey Target</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target-count" className="text-sm font-medium">
                  Target Response Count
                </Label>
                <Input
                  id="target-count"
                  type="number"
                  value={customTarget}
                  onChange={(e) => handleTargetCountChange(e.target.value)}
                  className="mt-2"
                  min="1"
                  max={estimatedReach}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Maximum: {estimatedReach.toLocaleString()} (based on selected criteria)
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Target</span>
                  <span className="font-medium">{audience.targetCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Available</span>
                  <span className="font-medium">{estimatedReach.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Coverage</span>
                  <span className="font-medium">
                    {estimatedReach > 0 ? Math.round((audience.targetCount / estimatedReach) * 100) : 0}%
                  </span>
                </div>
              </div>

              {audience.targetCount > estimatedReach && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Target exceeds available audience. Consider adjusting criteria or target count.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Source */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={audience.dataSource}
                onValueChange={(value) => onAudienceUpdate({ ...audience, dataSource: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default Audience Database</SelectItem>
                  <SelectItem value="imported">Imported Contacts</SelectItem>
                  <SelectItem value="segments">Custom Segments</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-2">Choose the source for your survey distribution</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
