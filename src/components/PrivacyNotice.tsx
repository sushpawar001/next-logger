import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyNotice() {
    return (
        <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-blue-800 font-medium">
                        Your data is not stored or sent to the server. All
                        calculations are performed locally in your browser.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
