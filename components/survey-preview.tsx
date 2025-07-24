import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface SurveyPreviewProps {
  title: string
  description: string
  questions: {
    id: string
    type: string
    question: string
    options?: string[]
    required: boolean
  }[]
}

export default function SurveyPreview({ title, description, questions }: SurveyPreviewProps) {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-violet-200 mb-4">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
          <CardTitle className="text-xl text-violet-900">{title}</CardTitle>
          <p className="text-violet-700 mt-2">{description}</p>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {questions.map((q, index) => (
          <Card key={q.id} className="border border-slate-200 hover:border-slate-300 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  {index + 1}. {q.question}
                  {q.required && <span className="ml-2 text-red-500 text-sm">*</span>}
                </h3>
              </div>

              {q.type === "multiple_choice" && (
                <RadioGroup className="space-y-2">
                  {q.options?.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <RadioGroupItem value={`option-${i}`} id={`option-${q.id}-${i}`} />
                      <Label htmlFor={`option-${q.id}-${i}`} className="text-sm font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {q.type === "checkbox" && (
                <div className="space-y-3">
                  {q.options?.map((option, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Checkbox id={`checkbox-${q.id}-${i}`} />
                      <Label htmlFor={`checkbox-${q.id}-${i}`} className="text-sm font-normal">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {q.type === "text" && (
                <Textarea placeholder="Type your answer here..." className="resize-none h-24" disabled />
              )}

              {q.type === "rating" && (
                <div className="space-y-3">
                  <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50 transition-colors font-medium"
                        disabled
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 px-2">
                    <span>Not likely</span>
                    <span>Very likely</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6 text-center">
          <Button size="lg" disabled className="bg-violet-600 hover:bg-violet-700">
            Submit Survey
          </Button>
          <p className="text-xs text-slate-500 mt-3">This is a preview - the actual survey will be interactive</p>
        </CardContent>
      </Card>
    </div>
  )
}
