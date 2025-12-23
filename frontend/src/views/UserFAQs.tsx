
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActiveFAQs } from "@/hooks/useFAQ";
import { Loader2 } from "lucide-react";

export const UserFAQs = () => {
  const { data: faqs, isLoading } = useActiveFAQs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions and guides.</p>
      </div>

      <div className="grid gap-4">
        {faqs?.map((faq) => (
          <Card key={faq.id}>
            <CardHeader>
              <CardTitle className="text-lg">{faq.question}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                 <Badge variant="outline">{faq.category}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
        {faqs?.length === 0 && (
           <div className="text-center py-10 text-muted-foreground">No FAQs available yet.</div>
        )}
      </div>
    </div>
  );
};
