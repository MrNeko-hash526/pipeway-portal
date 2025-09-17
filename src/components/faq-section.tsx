"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, HelpCircle } from "lucide-react"

const faqData = [
  {
    id: "faq-1",
    question: "How do I track the status of my accounts?",
    answer:
      "You can track your accounts in real-time through the Client Account Tracker section. Use the search and filter options to find specific accounts and view their current status, payment history, and attorney assignments.",
  },
  {
    id: "faq-2",
    question: "What do the different account statuses mean?",
    answer:
      "Active: Account is being actively worked. In Suit: Legal action has been initiated. Served: Legal documents have been served to the debtor. Judgment: Court judgment has been obtained.",
  },
  {
    id: "faq-3",
    question: "How often is the dashboard data updated?",
    answer:
      "Dashboard data is updated in real-time as new information becomes available. Portfolio values, account statuses, and collection metrics are refreshed automatically every few minutes.",
  },
  {
    id: "faq-4",
    question: "Can I export my account data?",
    answer:
      "Yes, you can export account data and reports using the Export buttons available in various sections. Data can be exported in CSV, Excel, or PDF formats depending on your needs.",
  },
  {
    id: "faq-5",
    question: "How do I contact my assigned attorney?",
    answer:
      "Attorney contact information is available in the account details. You can also use the contact form below to reach out to our legal team for specific questions about your accounts.",
  },
  {
    id: "faq-6",
    question: "What security measures protect my data?",
    answer:
      "We use industry-standard encryption, secure authentication, and regular security audits to protect your sensitive financial data. All communications are encrypted and access is logged for security purposes.",
  },
]

export function FAQSection() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <section id="faq" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-balance">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-pretty">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No FAQs found matching your search.</div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
