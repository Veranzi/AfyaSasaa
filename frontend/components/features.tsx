import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Activity, Package, CreditCard, Users, Shield } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI Risk Assessment",
      description:
        "Advanced machine learning models analyze symptoms, medical history, and scan results to predict cyst growth patterns and malignancy risk.",
      color: "from-pink-500 to-purple-500",
    },
    {
      icon: Activity,
      title: "Growth Prediction",
      description:
        "Real-time forecasting of ovarian cyst development using historical data and patient-specific factors for proactive treatment planning.",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: Package,
      title: "Smart Inventory",
      description:
        "Automated tracking of medical supplies, medications, and equipment with predictive restocking for uninterrupted care delivery.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: CreditCard,
      title: "Cost Transparency",
      description:
        "Clear financial tracking and cost-effective treatment recommendations optimized for low-resource healthcare settings.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Care Coordination",
      description:
        "Seamless communication between healthcare providers, patients, and community health workers for comprehensive care delivery.",
      color: "from-pink-400 to-rose-400",
    },
    {
      icon: Shield,
      title: "Data Security",
      description:
        "HIPAA-compliant platform with end-to-end encryption ensuring patient privacy and secure health data management.",
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Care Platform</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our integrated solution addresses every aspect of ovarian cyst care, from early detection to treatment
            coordination and financial management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
