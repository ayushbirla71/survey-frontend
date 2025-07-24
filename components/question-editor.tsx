"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, GripVertical } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Badge } from "@/components/ui/badge"

interface Question {
  id: string
  type: string
  question: string
  options?: string[]
  required: boolean
}

interface QuestionEditorProps {
  questions: Question[]
  onQuestionsUpdate: (questions: Question[]) => void
}

export default function QuestionEditor({ questions, onQuestionsUpdate }: QuestionEditorProps) {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(questions.length > 0 ? questions[0].id : null)

  const handleQuestionChange = (id: string, field: string, value: any) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === id) {
        return { ...q, [field]: value }
      }
      return q
    })
    onQuestionsUpdate(updatedQuestions)
  }

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    })
    onQuestionsUpdate(updatedQuestions)
  }

  const addOption = (questionId: string) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId) {
        const options = q.options || []
        return { ...q, options: [...options, `Option ${options.length + 1}`] }
      }
      return q
    })
    onQuestionsUpdate(updatedQuestions)
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    const updatedQuestions = questions.map((q) => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options]
        newOptions.splice(optionIndex, 1)
        return { ...q, options: newOptions }
      }
      return q
    })
    onQuestionsUpdate(updatedQuestions)
  }

  const addQuestion = () => {
    const newQuestion = {
      id: `q${Date.now()}`,
      type: "multiple_choice",
      question: "New Question",
      options: ["Option 1", "Option 2"],
      required: false,
    }
    const updatedQuestions = [...questions, newQuestion]
    onQuestionsUpdate(updatedQuestions)
    setActiveQuestion(newQuestion.id)
  }

  const removeQuestion = (id: string) => {
    const updatedQuestions = questions.filter((q) => q.id !== id)
    onQuestionsUpdate(updatedQuestions)

    if (activeQuestion === id) {
      setActiveQuestion(updatedQuestions.length > 0 ? updatedQuestions[0].id : null)
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(questions)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onQuestionsUpdate(items)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Edit Questions</h2>
        <Button onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Questions ({questions.length})</h3>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {questions.map((question, index) => (
                      <Draggable key={question.id} draggableId={question.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex cursor-pointer items-center rounded-lg border p-3 transition-all hover:shadow-sm ${
                              activeQuestion === question.id
                                ? "border-violet-500 bg-violet-50 shadow-sm"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            onClick={() => setActiveQuestion(question.id)}
                          >
                            <div {...provided.dragHandleProps} className="mr-3">
                              <GripVertical className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{question.question}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {question.type.replace("_", " ")}
                                </Badge>
                                {question.required && (
                                  <Badge variant="secondary" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeQuestion && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Question Details</CardTitle>
                <Button variant="destructive" size="sm" onClick={() => removeQuestion(activeQuestion)} className="h-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {questions
                  .filter((q) => q.id === activeQuestion)
                  .map((question) => (
                    <div key={question.id} className="space-y-4">
                      <div>
                        <Label htmlFor="question-text" className="text-sm font-medium">
                          Question Text
                        </Label>
                        <Input
                          id="question-text"
                          value={question.question}
                          onChange={(e) => handleQuestionChange(question.id, "question", e.target.value)}
                          className="mt-2"
                          placeholder="Enter your question..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="question-type" className="text-sm font-medium">
                          Question Type
                        </Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => handleQuestionChange(question.id, "type", value)}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select question type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="required"
                          checked={question.required}
                          onCheckedChange={(checked) => handleQuestionChange(question.id, "required", checked)}
                        />
                        <Label htmlFor="required" className="text-sm font-medium">
                          Required Question
                        </Label>
                      </div>

                      {(question.type === "multiple_choice" || question.type === "checkbox") && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Answer Options</Label>
                          <div className="space-y-2">
                            {question.options?.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => handleOptionChange(question.id, index, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, index)}
                                  className="h-9 w-9 p-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button variant="outline" size="sm" onClick={() => addOption(question.id)} className="w-full">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          {!activeQuestion && questions.length > 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Select a Question</h3>
                  <p className="text-slate-500">Choose a question from the list to edit its details</p>
                </div>
              </CardContent>
            </Card>
          )}

          {questions.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-slate-700 mb-2">No Questions Yet</h3>
                  <p className="text-slate-500 mb-4">Start by adding your first question</p>
                  <Button onClick={addQuestion}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
