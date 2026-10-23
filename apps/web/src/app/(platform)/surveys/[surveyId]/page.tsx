"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

interface SurveyQuestion {
  id: string;
  text: string;
  type: "Rating" | "Multiple choice" | "Open text";
  responses: string;
}

interface SurveyRespondent {
  id: string;
  name: string;
  org: string;
  submitted: string;
  score: string;
  response: string;
  answers: Record<string, string>;
}

interface Survey {
  id: string;
  name: string;
  audience: string;
  status: { text: string; variant: "green" | "muted" };
  responses: string;
  rate: string;
  created: string;
  closes: string;
  avgSatisfaction: string;
  questions: SurveyQuestion[];
  respondents: SurveyRespondent[];
}

const surveys: Record<string, Survey> = {
  "platform-satisfaction-q3": {
    id: "platform-satisfaction-q3",
    name: "Platform Satisfaction Q3",
    audience: "All Users",
    status: { text: "Active", variant: "green" },
    responses: "1,240",
    rate: "68.2%",
    created: "Jul 1, 2026",
    closes: "Jul 31, 2026",
    avgSatisfaction: "4.2/5",
    questions: [
      { id: "q1", text: "How satisfied are you with the overall platform experience?", type: "Rating", responses: "1,240" },
      { id: "q2", text: "Which feature is most valuable to you?", type: "Multiple choice", responses: "1,180" },
      { id: "q3", text: "How would you rate the speed and performance of the platform?", type: "Rating", responses: "1,210" },
      { id: "q4", text: "How likely are you to recommend us to a colleague?", type: "Rating", responses: "1,198" },
      { id: "q5", text: "What is the biggest challenge you face on the platform?", type: "Open text", responses: "764" },
      { id: "q6", text: "What improvements would you like to see next quarter?", type: "Open text", responses: "612" },
    ],
    respondents: [
      { id: "s1", name: "Chidi Eze", org: "Demo University", submitted: "Jul 2, 2026 · 09:14", score: "5/5", response: "Very smooth experience overall. The new dashboard is much faster and easier to navigate. I particularly love the export features.", answers: { q1: "5/5", q2: "Export features", q3: "5/5", q4: "5/5", q5: "No major challenges; onboarding was quick and intuitive.", q6: "A dark theme and offline access would be nice." } },
      { id: "s2", name: "Amara Okafor", org: "Tech Institute", submitted: "Jul 3, 2026 · 14:42", score: "4/5", response: "Great platform, but I would like more granular reporting options. Otherwise everything works well.", answers: { q1: "4/5", q2: "Reporting & analytics", q3: "4/5", q4: "4/5", q5: "Limited granular reporting options.", q6: "More customizable dashboards and scheduling." } },
      { id: "s3", name: "Emeka Nwosu", org: "State University", submitted: "Jul 5, 2026 · 11:20", score: "5/5", response: "Excellent tool. Our institution manages thousands of students and the platform has handled the load effortlessly.", answers: { q1: "5/5", q2: "Bulk operations", q3: "5/5", q4: "5/5", q5: "Handling thousands of students at scale.", q6: "Batch import improvements for student records." } },
      { id: "s4", name: "Grace Lim", org: "Central College", submitted: "Jul 8, 2026 · 16:05", score: "4/5", response: "Very reliable. The mobile experience could be improved but desktop is fantastic.", answers: { q1: "4/5", q2: "Attendance tracking", q3: "4/5", q4: "5/5", q5: "The mobile experience could be improved.", q6: "A native mobile app and push notifications." } },
      { id: "s5", name: "Tom Wallace", org: "Umbrella Academy", submitted: "Jul 11, 2026 · 08:33", score: "3/5", response: "Good platform overall. Some API endpoints were slow during peak hours last week.", answers: { q1: "3/5", q2: "API access", q3: "3/5", q4: "3/5", q5: "Slow API endpoints during peak hours.", q6: "Performance fixes and a public API changelog." } },
    ],
  },
  "feature-priority": {
    id: "feature-priority",
    name: "Feature Priority Survey",
    audience: "Org Admins",
    status: { text: "Active", variant: "green" },
    responses: "420",
    rate: "72.1%",
    created: "Jul 10, 2026",
    closes: "Aug 10, 2026",
    avgSatisfaction: "4.4/5",
    questions: [
      { id: "q1", text: "Which new feature is the highest priority for your organization?", type: "Multiple choice", responses: "420" },
      { id: "q2", text: "How important is automated reporting to you?", type: "Rating", responses: "415" },
      { id: "q3", text: "Which integration would you use most?", type: "Multiple choice", responses: "398" },
      { id: "q4", text: "Describe a workflow you would like automated.", type: "Open text", responses: "287" },
      { id: "q5", text: "How satisfied are you with the current feature set?", type: "Rating", responses: "410" },
    ],
    respondents: [
      { id: "f1", name: "Mrs. Okafor", org: "Demo University", submitted: "Jul 12, 2026 · 10:00", score: "5/5", response: "Automated attendance reports would save our staff hours every week. That is my top priority.", answers: { q1: "Automated attendance reports", q2: "5/5", q3: "School Information System (SIS)", q4: "Automate weekly attendance summaries to parents.", q5: "5/5" } },
      { id: "f2", name: "Mr. Adeyemi", org: "State University", submitted: "Jul 14, 2026 · 13:45", score: "4/5", response: "We need better parent communication features and an integration with our existing SIS.", answers: { q1: "Parent communication tools", q2: "4/5", q3: "Student Information System (SIS)", q4: "Auto-send term reports to guardians.", q5: "4/5" } },
      { id: "f3", name: "Ms. Tran", org: "Tech Institute", submitted: "Jul 16, 2026 · 09:30", score: "5/5", response: "Bulk course creation and term rollover would be a huge win for us.", answers: { q1: "Bulk course creation", q2: "5/5", q3: "Learning Management System (LMS)", q4: "Roll over courses and schedules each term automatically.", q5: "5/5" } },
    ],
  },
  "onboarding-feedback": {
    id: "onboarding-feedback",
    name: "Onboarding Feedback",
    audience: "New Users",
    status: { text: "Active", variant: "green" },
    responses: "890",
    rate: "54.3%",
    created: "Jun 15, 2026",
    closes: "Ongoing",
    avgSatisfaction: "4.0/5",
    questions: [
      { id: "q1", text: "How easy was it to get started with the platform?", type: "Rating", responses: "890" },
      { id: "q2", text: "How clear were the setup instructions?", type: "Rating", responses: "872" },
      { id: "q3", text: "What was the most confusing part of onboarding?", type: "Open text", responses: "540" },
      { id: "q4", text: "Which onboarding resource did you find most useful?", type: "Multiple choice", responses: "830" },
      { id: "q5", text: "Would you recommend the onboarding experience to others?", type: "Rating", responses: "845" },
    ],
    respondents: [
      { id: "o1", name: "Ngozi Adeyemi", org: "Acme Corp", submitted: "Jun 17, 2026 · 12:10", score: "4/5", response: "Setup was straightforward. The video tutorials were the most helpful part.", answers: { q1: "4/5", q2: "5/5", q3: "Role configuration", q4: "Video tutorials", q5: "4/5" } },
      { id: "o2", name: "Ifeanyi Obi", org: "Globex", submitted: "Jun 20, 2026 · 15:22", score: "5/5", response: "Everything was clear and the support team responded quickly when I had questions.", answers: { q1: "5/5", q2: "5/5", q3: "Nothing, everything was clear.", q4: "Live onboarding calls", q5: "5/5" } },
      { id: "o3", name: "Yemi Afolabi", org: "Initech", submitted: "Jun 24, 2026 · 09:55", score: "3/5", response: "The initial setup was fine but the role configuration section was a bit confusing.", answers: { q1: "3/5", q2: "3/5", q3: "Role configuration section", q4: "Documentation guides", q5: "3/5" } },
    ],
  },
  "support-quality-review": {
    id: "support-quality-review",
    name: "Support Quality Review",
    audience: "Ticket Submitters",
    status: { text: "Closed", variant: "muted" },
    responses: "340",
    rate: "61.8%",
    created: "May 1, 2026",
    closes: "May 31, 2026",
    avgSatisfaction: "4.1/5",
    questions: [
      { id: "q1", text: "How satisfied were you with the resolution of your ticket?", type: "Rating", responses: "340" },
      { id: "q2", text: "How fast was our support response time?", type: "Rating", responses: "336" },
      { id: "q3", text: "Which channel did you use to contact support?", type: "Multiple choice", responses: "331" },
      { id: "q4", text: "Describe what could have been handled better.", type: "Open text", responses: "198" },
      { id: "q5", text: "How knowledgeable was the support agent?", type: "Rating", responses: "325" },
    ],
    respondents: [
      { id: "u1", name: "Fatima Abubakar", org: "Umbrella", submitted: "May 4, 2026 · 10:18", score: "5/5", response: "My billing issue was resolved within the hour. Great experience.", answers: { q1: "5/5", q2: "5/5", q3: "Email", q4: "Nothing, resolved quickly.", q5: "5/5" } },
      { id: "u2", name: "Tunde Balogun", org: "Acme Corp", submitted: "May 9, 2026 · 14:05", score: "4/5", response: "Helpful agent, but it took two follow-ups to get a final answer.", answers: { q1: "4/5", q2: "3/5", q3: "Live chat", q4: "Fewer follow-ups needed.", q5: "4/5" } },
      { id: "u3", name: "Amara Okafor", org: "Tech Institute", submitted: "May 15, 2026 · 16:40", score: "3/5", response: "Resolution took longer than expected for a simple configuration change.", answers: { q1: "3/5", q2: "2/5", q3: "Phone", q4: "Faster resolution for simple configuration changes.", q5: "3/5" } },
    ],
  },
  "nps-assessment": {
    id: "nps-assessment",
    name: "NPS Assessment",
    audience: "All Users",
    status: { text: "Draft", variant: "muted" },
    responses: "—",
    rate: "—",
    created: "Jul 25, 2026",
    closes: "Aug 25, 2026",
    avgSatisfaction: "—",
    questions: [
      { id: "q1", text: "How likely are you to recommend our platform?", type: "Rating", responses: "—" },
      { id: "q2", text: "What is the primary reason for your score?", type: "Open text", responses: "—" },
      { id: "q3", text: "Which area should we focus on improving?", type: "Multiple choice", responses: "—" },
      { id: "q4", text: "How long have you been using the platform?", type: "Multiple choice", responses: "—" },
      { id: "q5", text: "What would make you a more loyal customer?", type: "Open text", responses: "—" },
    ],
    respondents: [],
  },
};

const questionTypeVariant: Record<SurveyQuestion["type"], "green" | "blue" | "muted"> = {
  Rating: "green",
  "Multiple choice": "blue",
  "Open text": "muted",
};

export default function SurveyDetailPage() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const survey = surveys[surveyId];
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleRespondent = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!survey) {
    return (
      <div className="max-w-[1100px] mx-auto">
        <PageHeader title="Survey Not Found" subtitle="" />
        <Link href="/surveys">
          <Button variant="secondary">Back to Surveys</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="mb-4">
        <Link href="/surveys" className="text-sm text-text-muted hover:text-text-dark transition-colors">
          ← Back to Surveys
        </Link>
      </div>

      <PageHeader
        title={survey.name}
        subtitle={`${survey.audience} · Created ${survey.created} · Closes ${survey.closes}`}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Responses" value={survey.responses} detail="" detailColor="muted" />
        <StatCard label="Response Rate" value={survey.rate} detail="" detailColor="green" />
        <StatCard label="Avg Satisfaction" value={survey.avgSatisfaction} detail="" detailColor="muted" />
        <StatCard label="Questions" value={String(survey.questions.length)} detail="" detailColor="muted" />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-text-dark">Questions</h2>
          <Badge variant={survey.status.variant}>{survey.status.text}</Badge>
        </div>
        <Card className="divide-y divide-border-light">
          {survey.questions.map((q, i) => (
            <div key={q.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-dark">{i + 1}. {q.text}</p>
                <p className="text-xs text-text-muted mt-0.5">{q.responses} responses</p>
              </div>
              <Badge variant={questionTypeVariant[q.type]}>{q.type}</Badge>
            </div>
          ))}
        </Card>
      </div>

      <div>
        <h2 className="text-base font-semibold text-text-dark mb-3">Users &amp; Responses</h2>
        {survey.respondents.length === 0 ? (
          <Card className="px-5 py-6 text-center text-sm text-text-muted">
            No responses yet.
          </Card>
        ) : (
          <Card className="divide-y divide-border-light">
            {survey.respondents.map((r) => (
              <div key={r.id}>
                <button
                  onClick={() => toggleRespondent(r.id)}
                  className="w-full text-left flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-dark">{r.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{r.org} · Submitted {r.submitted}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="green">{r.score}</Badge>
                    <span className="text-xs text-text-muted">{expanded.has(r.id) ? "Hide" : "View"}</span>
                  </div>
                </button>
                {expanded.has(r.id) && (
                  <div className="px-5 pb-4">
                    <div className="rounded-lg border border-border-light overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border-light bg-surface/50">
                            <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Question</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-[240px]">Response</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                          {survey.questions.map((q) => (
                            <tr key={q.id}>
                              <td className="px-4 py-2.5 text-xs text-text-dark align-top">
                                <span className="text-text-muted mr-1">{survey.questions.findIndex((x) => x.id === q.id) + 1}.</span>
                                {q.text}
                              </td>
                              <td className="px-4 py-2.5 text-sm text-text-dark">{r.answers[q.id] ?? "No response"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}