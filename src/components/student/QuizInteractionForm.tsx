'use client';
import React, { useMemo, useState } from 'react';
import { HelpCircle, Send, Loader2, Square, CheckSquare, Circle, CheckCircle } from 'lucide-react';

const QuizInteractionForm = ({
    questions = [],
    onSubmit,
    isSubmitting,
    totalQuestions,
}: {
    questions: any[];
    onSubmit: (answers: any[]) => void;
    isSubmitting?: boolean;
    totalQuestions?: number;
}) => {
    const [answers, setAnswers] = useState<Record<number, any>>({});
    const [confirming, setConfirming] = useState(false);

    const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
    const expected = totalQuestions ?? questions.length;

    const handleOptionSelect = (qId: number, qType: string, optId: number) => {
        if (isSubmitting) return;
        const current = answers[qId] || {
            question_id: qId,
            selected_option_ids: [] as number[],
            text_answer: '',
        };

        if (qType === 'MCQ') {
            current.selected_option_ids = [optId];
        } else if (qType === 'BCQ') {
            const index = current.selected_option_ids.indexOf(optId);
            if (index > -1) current.selected_option_ids.splice(index, 1);
            else current.selected_option_ids.push(optId);
        }
        setAnswers({ ...answers, [qId]: { ...current } });
    };

    const handleTextChange = (qId: number, text: string) => {
        if (isSubmitting) return;
        setAnswers({
            ...answers,
            [qId]: { question_id: qId, selected_option_ids: [], text_answer: text },
        });
    };

    const formatAndSubmit = () => {
        if (isSubmitting) return;
        if (!confirming) {
            setConfirming(true);
            return;
        }
        const formattedAnswers = Object.values(answers).map((a: any) => ({
            question_id: Number(a.question_id),
            selected_option_ids: Array.isArray(a.selected_option_ids)
                ? a.selected_option_ids.map(Number)
                : [],
            text_answer: a.text_answer || '',
        }));
        onSubmit(formattedAnswers);
        setConfirming(false);
    };

    const getReadableType = (type: string) => {
        if (type === 'MCQ') return 'Single Choice';
        if (type === 'BCQ') return 'Multiple Choice';
        if (type === 'SHORT') return 'Short Answer';
        return type;
    };

    if (!questions.length) {
        return (
            <div className="rounded-2xl border border-border-subtle bg-card-bg p-10 text-center text-xs font-bold uppercase tracking-widest text-text-muted">
                No questions in this quiz
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col gap-6">
                {questions.map((q: any, index: number) => (
                    <div
                        key={q.id}
                        className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm"
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-3">
                            <div className="flex gap-3">
                                <span className="text-accent-blue font-black text-lg">
                                    {index + 1}.
                                </span>
                                <div className="space-y-1.5 mt-1">
                                    <h3 className="text-base md:text-lg font-bold text-text-main leading-snug">
                                        {q.question_text}
                                    </h3>
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                                        <span>{getReadableType(q.question_type)}</span>
                                        <span className="w-1 h-1 bg-border-subtle rounded-full" />
                                        <span>{q.marks} Points</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pl-6 sm:pl-8">
                            {q.question_type === 'SHORT' ? (
                                <textarea
                                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                                    placeholder="Type your answer here..."
                                    disabled={isSubmitting}
                                    className="w-full bg-app-bg border border-border-subtle rounded-xl p-4 text-sm text-text-main outline-none focus:border-accent-blue transition-colors min-h-[120px] resize-y disabled:opacity-60"
                                />
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {(q.options || []).map((opt: any) => {
                                        const isSelected = answers[
                                            q.id
                                        ]?.selected_option_ids?.includes(opt.id);
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                disabled={isSubmitting}
                                                onClick={() =>
                                                    handleOptionSelect(
                                                        q.id,
                                                        q.question_type,
                                                        opt.id
                                                    )
                                                }
                                                className={`p-4 rounded-xl border-2 text-left flex items-start gap-3 transition-all disabled:opacity-60 ${
                                                    isSelected
                                                        ? 'bg-accent-blue/5 border-accent-blue text-accent-blue'
                                                        : 'bg-app-bg border-border-subtle text-text-main hover:border-accent-blue/40'
                                                }`}
                                            >
                                                <div
                                                    className={`mt-0.5 shrink-0 transition-colors ${
                                                        isSelected
                                                            ? 'text-accent-blue'
                                                            : 'text-text-muted/40'
                                                    }`}
                                                >
                                                    {q.question_type === 'MCQ' ? (
                                                        isSelected ? (
                                                            <CheckCircle size={18} />
                                                        ) : (
                                                            <Circle size={18} />
                                                        )
                                                    ) : isSelected ? (
                                                        <CheckSquare size={18} />
                                                    ) : (
                                                        <Square size={18} />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-sm font-medium leading-relaxed ${
                                                        isSelected
                                                            ? 'text-text-main'
                                                            : 'text-text-muted'
                                                    }`}
                                                >
                                                    {opt.option_text}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-card-bg border border-border-subtle rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className="w-12 h-12 bg-app-bg rounded-full flex items-center justify-center text-text-muted border border-border-subtle shrink-0 hidden sm:flex">
                        <HelpCircle size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-main mb-1">
                            {confirming ? 'Confirm submission?' : 'Ready to submit?'}
                        </h4>
                        <p className="text-xs text-text-muted font-medium">
                            {confirming
                                ? `You answered ${answeredCount} of ${expected} questions. This cannot be undone.`
                                : answeredCount < expected
                                  ? `Answered ${answeredCount}/${expected}. You can still submit incomplete answers.`
                                  : 'Please review your answers before submitting. This action cannot be undone.'}
                        </p>
                    </div>
                </div>

                <div className="flex w-full md:w-auto items-center gap-2">
                    {confirming && (
                        <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={isSubmitting}
                            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={formatAndSubmit}
                        disabled={isSubmitting}
                        className={`flex-1 md:flex-none px-8 py-3.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 ${
                            confirming ? 'bg-emerald-600' : 'bg-accent-blue'
                        }`}
                    >
                        {isSubmitting ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <Send size={16} />
                        )}
                        <span>{confirming ? 'Confirm Submit' : 'Submit Answers'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizInteractionForm;
