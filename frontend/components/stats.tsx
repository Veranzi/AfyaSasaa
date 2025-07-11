import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Clock, DollarSign } from "lucide-react"

export function Stats() {
  const stats = [
    {
      icon: Users,
      value: "1.2M+",
      label: "Women Affected Annually",
      description: "Ovarian cysts impact millions globally",
    },
    {
      icon: Target,
      value: "94%",
      label: "Prediction Accuracy",
      description: "AI model performance in trials",
    },
    {
      icon: Clock,
      value: "60%",
      label: "Faster Diagnosis",
      description: "Reduced time to treatment",
    },
    {
      icon: DollarSign,
      value: "40%",
      label: "Cost Reduction",
      description: "Healthcare savings achieved",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Transforming Women's Healthcare</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI-powered platform is making a real impact on ovarian cyst diagnosis and treatment worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-purple-600 mb-2">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
