import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Settings } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div style={{ backgroundColor: "#FFF5FF" }} className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-medium">Settings</h1>
        </div>

        <Card className="mb-6 shadow-sm">
          <CardContent className="p-0">
            <Link href="/customer/settingsPage/change-password" className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <span className="text-sm">Change my password</span>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </CardContent>
        </Card>

        <div className="mt-24 flex justify-center">
                  <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600">
                    Deactivate my account
                  </Button>
                </div>

        <div className="text-center">
          <Link href="#" className="text-sm text-gray-600 hover:text-gray-800">
            Get help
          </Link>
        </div>
      </div>
    </div>
  )
}

