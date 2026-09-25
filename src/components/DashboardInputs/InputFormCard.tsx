import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { LucideIcon } from "lucide-react";

interface InputFormCardProps {
    title: string;
    icon: LucideIcon;
    gradient: string;
    fields: Array<{
        label: string;
        type: "input" | "select" | "datetime";
        placeholder?: string;
        options?: string[];
        value?: string;
    }>;
}

export function InputFormCard({
    title,
    icon: Icon,
    gradient,
    fields,
}: InputFormCardProps) {
    return (
        <Card className="border-border hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                    <div className={`p-2 rounded-lg ${gradient}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.map((field, index) => (
                    <div key={index} className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                            {field.label}
                        </Label>
                        {field.type === "input" && (
                            <Input
                                placeholder={field.placeholder}
                                defaultValue={field.value}
                                className="border-border focus:border-primary focus:ring-ring"
                            />
                        )}
                        {field.type === "select" && (
                            <Select defaultValue={field.value}>
                                <SelectTrigger className="border-border focus:border-primary focus:ring-ring">
                                    <SelectValue
                                        placeholder={field.placeholder}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {field.options?.map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {field.type === "datetime" && (
                            <Input
                                type="datetime-local"
                                defaultValue={field.value}
                                className="border-border focus:border-primary focus:ring-ring"
                            />
                        )}
                    </div>
                ))}

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg">
                    Submit
                </Button>
            </CardContent>
        </Card>
    );
}
