"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Download,
  Share2,
  Users,
  Clock,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { surveyResults } from "@/lib/assist-data";
import { useParams } from "next/navigation";
import { surveyResultsApi, apiWithFallback } from "@/lib/api";
import { useApi, usePaginatedApi } from "@/hooks/useApi";

export default function SurveyResults() {
  const params = useParams();
  const surveyId = params.id as string;

  // API calls with fallback to demo data
  const {
    data: results,
    loading: resultsLoading,
    error: resultsError,
    refetch: refetchResults,
  } = useApi(() => {
    // Use demo data as fallback
    const demoResult = surveyResults[surveyId] || surveyResults["survey-1"];
    return apiWithFallback(
      () => surveyResultsApi.getSurveyResults(surveyId),
      demoResult
    );
  }, [surveyId]);

  const {
    data: individualResponses,
    pagination,
    loading: responsesLoading,
    updateParams,
    refetch: refetchResponses,
  } = usePaginatedApi(
    (params) => surveyResultsApi.getIndividualResponses(surveyId, params),
    { page: 1, limit: 10 }
  );

  // Use API data if available, otherwise use demo data

  const survey =
    results || surveyResults[surveyId] || surveyResults["survey-1"];

  const handleExport = async (format: "csv" | "excel" | "pdf" | "json") => {
    try {
      const blob = await surveyResultsApi.exportSurveyData(surveyId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `survey_results_${surveyId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    }
  };

  const handleRefresh = () => {
    refetchResults();
    refetchResponses();
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800">
              {survey.title}
            </h1>
            <p className="text-slate-500">{survey.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={resultsLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  resultsLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {resultsError && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Using demo data - API connection failed: {resultsError}
            </p>
          </div>
        )}

        {/* Survey Status */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <Users className="mr-3 h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {resultsLoading ? "..." : survey.stats?.totalResponses || 0}
                </p>
                <p className="text-sm text-slate-500">Total Responses</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <CheckCircle className="mr-3 h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {resultsLoading ? "..." : survey.stats?.completionRate || 0}%
                </p>
                <p className="text-sm text-slate-500">Completion Rate</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <Clock className="mr-3 h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {resultsLoading ? "..." : survey.stats?.avgTime || 0} min
                </p>
                <p className="text-sm text-slate-500">Avg. Time</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center p-4">
              <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                <span className="text-sm font-bold text-violet-600">
                  {resultsLoading ? "..." : survey.stats?.npsScore || 0}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">NPS Score</p>
                <p className="text-sm text-slate-500">Net Promoter</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Survey Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="responses">Individual Responses</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="export">Export Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {resultsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            /* Question Results */
            survey.questionResults?.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{question.question}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{question.type}</Badge>
                    <span className="text-sm text-slate-500">
                      {question.responses} responses
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {question.type === "single_choice" && (
                    <div className="space-y-3">
                      {question.data?.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{item.option}</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={item.percentage}
                              className="w-32"
                            />
                            <span className="text-sm font-medium">
                              {item.percentage}%
                            </span>
                            <span className="text-xs text-slate-500">
                              ({item.count})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === "rating" && (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-violet-600">
                          {question.averageRating}
                        </div>
                        <div className="text-sm text-slate-500">
                          Average Rating
                        </div>
                      </div>
                      <BarChart
                        data={question.data || []}
                        index="rating"
                        categories={["count"]}
                        colors={["violet"]}
                        valueFormatter={(value) => `${value} responses`}
                        className="h-48"
                      />
                    </div>
                  )}

                  {question.type === "text" && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500">
                        Recent responses:
                      </p>
                      {question.sampleResponses?.map((response, i) => (
                        <div
                          key={i}
                          className="rounded-md bg-slate-50 p-3 text-sm"
                        >
                          "{response}"
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Responses</CardTitle>
            </CardHeader>
            <CardContent>
              {responsesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : (
                <div className="space-y-4">
                  {(
                    individualResponses ||
                    survey.individualResponses ||
                    []
                  ).map((response, index) => (
                    <div
                      key={response.id || index}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-medium">
                          Response #{response.id}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {response.completionTime} min
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {response.submittedAt}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {response.answers?.map((answer, i) => (
                          <div key={i} className="text-sm">
                            <span className="font-medium">
                              {answer.question}:
                            </span>
                            <span className="ml-2 text-slate-600">
                              {answer.answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination for individual responses */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateParams({ page: Math.max(1, pagination.page - 1) })
                    }
                    disabled={pagination.page === 1 || responsesLoading}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      updateParams({
                        page: Math.min(
                          pagination.totalPages,
                          pagination.page + 1
                        ),
                      })
                    }
                    disabled={
                      pagination.page === pagination.totalPages ||
                      responsesLoading
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          {resultsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={survey.demographics?.age || []}
                    index="ageGroup"
                    categories={["count"]}
                    colors={["violet", "indigo", "emerald", "amber", "rose"]}
                    className="h-64"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart
                    data={survey.demographics?.gender || []}
                    index="gender"
                    categories={["count"]}
                    colors={["violet", "indigo", "emerald"]}
                    className="h-64"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Location Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart
                    data={survey.demographics?.location || []}
                    index="location"
                    categories={["count"]}
                    colors={["violet"]}
                    valueFormatter={(value) => `${value} responses`}
                    className="h-64"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart
                    data={survey.responseTimeline || []}
                    index="date"
                    categories={["responses"]}
                    colors={["violet"]}
                    valueFormatter={(value) => `${value} responses`}
                    className="h-64"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="export">
          <Card>
            <CardHeader>
              <CardTitle>Export Survey Data</CardTitle>
              <p className="text-slate-500">
                Download your survey results in various formats
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => handleExport("csv")}
                  >
                    <Download className="mb-2 h-6 w-6" />
                    Export as CSV
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => handleExport("excel")}
                  >
                    <Download className="mb-2 h-6 w-6" />
                    Export as Excel
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => handleExport("pdf")}
                  >
                    <Download className="mb-2 h-6 w-6" />
                    Export as PDF Report
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col bg-transparent"
                    onClick={() => handleExport("json")}
                  >
                    <Download className="mb-2 h-6 w-6" />
                    Export Raw Data (JSON)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
