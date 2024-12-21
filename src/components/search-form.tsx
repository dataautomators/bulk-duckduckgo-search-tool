"use client";

import { addSearches } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import useFingerprint from "@/hooks/useFingerprint";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  queries: z.string().nonempty("Query cannot be empty"),
});

export default function SearchForm() {
  const { fingerprint } = useFingerprint();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      queries: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const formattedQueries = values.queries
      .split("\n")
      .map((query) => query.trim())
      .filter(Boolean);

    await addSearches({ queries: formattedQueries, fingerprint: fingerprint! });

    // Clear the form
    form.reset();
  };

  return (
    <div className="mb-4 p-6 shadow-md rounded-lg w-full max-w-5xl space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="queries"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Enter search queries (one per line):</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center space-x-4 mb-4">
            <Button type="submit">Process</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Clear
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
