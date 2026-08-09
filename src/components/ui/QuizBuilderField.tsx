'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle2,
    HelpCircle,
    ListChecks,
    MessageSquareText,
} from 'lucide-react';

interface QuizBuilderFieldProps {
    initialData?: any[];
    onChange: (data: any[]) => void;
    error?: string;
}

const TYPE_META: Record<
    string,
    { label: string; short: string; hint: string }
> = {
    MCQ: {
        label: 'Single choice',
        short: 'MCQ',
        hint: 'Students pick one correct option.',
    },
    BCQ: {
        label: 'Multiple choice',
        short: 'BCQ',
        hint: 'Students may pick more than one correct option.',
    },
    SHORT: {
        label: 'Short answer',
        short: 'SHORT',
        hint: 'Free text — graded manually after submission.',
    },
};

const OPTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const QuizBuilderField: React.FC<QuizBuilderFieldProps> = ({
    initialData,
    onChange,
    error,
}) => {
    const [questions, setQuestions] = useState<any[]>([]);
    const questionRefs = useRef<(HTMLElement | null)[]>([]);
    const scrollToIndexRef = useRef<number | null>(null);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setQuestions(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const index = scrollToIndexRef.current;
        if (index == null) return;
        scrollToIndexRef.current = null;

        const el = questionRefs.current[index];
        if (!el) return;

        // Wait a frame so the new card is laid out inside the modal scroller
        requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const input = el.querySelector<HTMLTextAreaElement>('textarea');
            input?.focus({ preventScroll: true });
        });
    }, [questions.length]);

    const updateAndNotify = (updated: any[]) => {
        setQuestions(updated);
        onChange(updated);
    };

    const addQuestion = () => {
        const nextIndex = questions.length;
        scrollToIndexRef.current = nextIndex;
        updateAndNotify([
            ...questions,
            {
                question_text: '',
                question_type: 'MCQ',
                marks: 5,
                options: [
                    { option_text: '', is_correct: true },
                    { option_text: '', is_correct: false },
                ],
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        updateAndNotify(questions.filter((_, i) => i !== index));
    };

    const toggleCorrectOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        const currentQ = updated[qIndex];

        if (currentQ.question_type === 'MCQ') {
            currentQ.options.forEach((opt: any, i: number) => {
                opt.is_correct = i === oIndex;
            });
        } else {
            currentQ.options[oIndex].is_correct = !currentQ.options[oIndex].is_correct;
        }
        updateAndNotify(updated);
    };

    const addOption = (qIndex: number) => {
        const updated = [...questions];
        if (!updated[qIndex].options) updated[qIndex].options = [];
        updated[qIndex].options.push({ option_text: '', is_correct: false });
        updateAndNotify(updated);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const updated = [...questions];
        updated[qIndex].options = updated[qIndex].options.filter(
            (_: any, i: number) => i !== oIndex
        );
        updateAndNotify(updated);
    };

    const updateQuestionText = (index: number, text: string) => {
        const updated = [...questions];
        updated[index].question_text = text;
        updateAndNotify(updated);
    };

    const updateQuestionType = (index: number, type: string) => {
        const updated = [...questions];
        updated[index].question_type = type;
        if (type === 'SHORT') {
            updated[index].options = [];
        } else if (!updated[index].options?.length) {
            updated[index].options = [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
            ];
        } else if (type === 'MCQ') {
            // Keep a single correct answer when switching to MCQ
            let found = false;
            updated[index].options.forEach((opt: any) => {
                if (opt.is_correct && !found) {
                    found = true;
                } else {
                    opt.is_correct = false;
                }
            });
            if (!found && updated[index].options[0]) {
                updated[index].options[0].is_correct = true;
            }
        }
        updateAndNotify(updated);
    };

    const updateMarks = (index: number, val: number) => {
        const updated = [...questions];
        updated[index].marks = val;
        updateAndNotify(updated);
    };

    const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
        const updated = [...questions];
        updated[qIndex].options[oIndex].option_text = text;
        updateAndNotify(updated);
    };

    const totalPoints = questions.reduce(
        (sum, q) => sum + (Number(q.marks) || 0),
        0
    );

    return (
        <div
            className={`md:col-span-2 rounded-2xl border overflow-hidden transition-colors ${
                error
                    ? 'border-red-500/40 bg-red-500/[0.04]'
                    : 'border-border-subtle bg-app-bg/60'
            }`}
        >
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border-subtle bg-card-bg/80">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-accent-blue/10 text-accent-blue flex items-center justify-center shrink-0">
                            <ListChecks size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black tracking-tight text-text-main">
                                Questions
                            </h3>
                            <p className="text-[11px] text-text-muted font-medium">
                                {questions.length} question
                                {questions.length === 1 ? '' : 's'}
                                {questions.length > 0
                                    ? ` · ${totalPoints} pts total (auto)`
                                    : ' · total marks sum from question points'}
                            </p>
                        </div>
                    </div>
                    {error && (
                        <p className="text-[11px] font-semibold text-red-500 mt-2">{error}</p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-hover-blue transition-colors active:scale-[0.98] shrink-0"
                >
                    <Plus size={15} strokeWidth={2.5} /> Add question
                </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
                {questions.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border-subtle bg-card-bg/50 px-6 py-12 text-center space-y-3">
                        <div className="mx-auto w-12 h-12 rounded-2xl bg-accent-blue/10 text-accent-blue flex items-center justify-center">
                            <HelpCircle size={22} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-main">No questions yet</p>
                            <p className="text-[12px] text-text-muted mt-1 max-w-xs mx-auto leading-relaxed">
                                Add MCQ, multi-select, or short-answer questions for students.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-accent-blue/30 text-accent-blue hover:bg-accent-blue/10 transition-colors"
                        >
                            <Plus size={14} /> Create first question
                        </button>
                    </div>
                ) : (
                    questions.map((q, qIndex) => {
                        const typeMeta = TYPE_META[q.question_type] || TYPE_META.MCQ;
                        const isShort = q.question_type === 'SHORT';

                        return (
                            <article
                                key={q.id ?? qIndex}
                                ref={(node) => {
                                    questionRefs.current[qIndex] = node;
                                }}
                                className="rounded-xl border border-border-subtle bg-card-bg shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200"
                            >
                                {/* Question header */}
                                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle bg-app-bg/40">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="w-7 h-7 rounded-lg bg-accent-blue text-white text-[11px] font-black flex items-center justify-center shrink-0 tabular-nums">
                                            {qIndex + 1}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-accent-blue/10 text-accent-blue border border-accent-blue/20">
                                            {typeMeta.short}
                                        </span>
                                        <span className="hidden sm:inline text-[11px] text-text-muted font-medium truncate">
                                            {typeMeta.label}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        title="Remove question"
                                        className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">
                                            Question text
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="What do you want to ask?"
                                            className="w-full resize-none rounded-xl border border-border-subtle bg-app-bg px-3.5 py-3 text-sm font-semibold text-text-main placeholder:font-normal placeholder:text-text-muted/70 outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15 transition-all leading-relaxed"
                                            value={q.question_text || ''}
                                            onChange={(e) =>
                                                updateQuestionText(qIndex, e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">
                                                Type
                                            </label>
                                            <select
                                                className="w-full h-[42px] px-3 bg-app-bg text-text-main rounded-xl text-sm font-medium outline-none border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15 transition-all"
                                                value={q.question_type}
                                                onChange={(e) =>
                                                    updateQuestionType(qIndex, e.target.value)
                                                }
                                            >
                                                <option value="MCQ">MCQ — Single choice</option>
                                                <option value="BCQ">BCQ — Multiple choice</option>
                                                <option value="SHORT">Short answer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5">
                                                Points
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                className="w-full h-[42px] px-3 bg-app-bg text-text-main rounded-xl text-sm font-bold tabular-nums outline-none border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/15 transition-all"
                                                value={q.marks ?? 0}
                                                onChange={(e) =>
                                                    updateMarks(qIndex, Number(e.target.value))
                                                }
                                            />
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-text-muted font-medium -mt-1">
                                        {typeMeta.hint}
                                    </p>

                                    {isShort ? (
                                        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border-subtle bg-app-bg/70 px-4 py-3.5">
                                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                                                <MessageSquareText size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[12px] font-bold text-text-main">
                                                    Manual grading
                                                </p>
                                                <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                                                    Students type a free-text answer. Review and
                                                    score it from Submissions.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                                                    Answer options
                                                </label>
                                                <span className="text-[10px] font-semibold text-text-muted">
                                                    Tap ✓ to mark correct
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                {q.options?.map((opt: any, oIndex: number) => {
                                                    const correct = Boolean(
                                                        opt.is_correct || opt.isCorrect
                                                    );
                                                    return (
                                                        <div
                                                            key={oIndex}
                                                            className={`flex items-center gap-2 sm:gap-3 rounded-xl border px-2.5 sm:px-3 py-2 transition-colors ${
                                                                correct
                                                                    ? 'border-emerald-500/35 bg-emerald-500/[0.08]'
                                                                    : 'border-border-subtle bg-app-bg'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`w-7 h-7 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 ${
                                                                    correct
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : 'bg-card-bg text-text-muted border border-border-subtle'
                                                                }`}
                                                            >
                                                                {OPTION_LETTERS[oIndex] || oIndex + 1}
                                                            </span>
                                                            <input
                                                                placeholder={`Option ${OPTION_LETTERS[oIndex] || oIndex + 1}`}
                                                                className="flex-1 min-w-0 text-sm font-medium bg-transparent py-1.5 outline-none text-text-main placeholder:text-text-muted/60"
                                                                value={opt.option_text || ''}
                                                                onChange={(e) =>
                                                                    updateOptionText(
                                                                        qIndex,
                                                                        oIndex,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggleCorrectOption(
                                                                        qIndex,
                                                                        oIndex
                                                                    )
                                                                }
                                                                title={
                                                                    correct
                                                                        ? 'Correct answer'
                                                                        : 'Mark as correct'
                                                                }
                                                                className={`p-2 rounded-lg transition-colors shrink-0 ${
                                                                    correct
                                                                        ? 'bg-emerald-500 text-white'
                                                                        : 'text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10 border border-border-subtle'
                                                                }`}
                                                            >
                                                                <CheckCircle2 size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeOption(qIndex, oIndex)
                                                                }
                                                                title="Remove option"
                                                                disabled={
                                                                    (q.options?.length || 0) <= 2
                                                                }
                                                                className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 disabled:opacity-30 disabled:pointer-events-none"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addOption(qIndex)}
                                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-accent-blue hover:text-hover-blue transition-colors pt-1"
                                            >
                                                <Plus size={14} /> Add option
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuizBuilderField;
