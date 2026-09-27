import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmptyResultsCard({ message }: { message: string }) {
    return (
        <Card className="border border-border shadow-md">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">
                    Results
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-48 text-gray-500">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Calculator
                                className="w-8 h-8 text-gray-400"
                                aria-hidden="true"
                            />
                        </div>
                        <p className="text-sm">{message}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
