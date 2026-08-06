'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface QuizBuilderFieldProps {
    initialData?: any[];
    onChange: (data: any[]) => void;
    error?: string;
}

const QuizBuilderField: React.FC<QuizBuilderFieldProps> = ({ initialData, onChange, error }) => {
    const [questions, setQuestions] = useState<any[]>([]);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setQuestions(initialData);
        }
    }, [initialData]);

    const updateAndNotify = (updated: any[]) => {
        setQuestions(updated);
        onChange(updated);
    };

    const addQuestion = () => {
        const newQuestions = [
            ...questions,
            { question_text: '', question_type: 'MCQ', marks: 5, options: [] }
        ];
        updateAndNotify(newQuestions);
    };

    const removeQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        updateAndNotify(updated);
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
        updated[qIndex].options = updated[qIndex].options.filter((_: any, i: number) => i !== oIndex);
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

    return (
        <div className={`md:col-span-2 space-y-4 bg-app-bg p-6 rounded-xl border transition-all ${error ? 'border-red-500/50 bg-red-50/50' : 'border-border-subtle'}`}>
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h3 className="text-sm font-bold text-text-main">Quiz Designer</h3>
                    {error && <p className="text-xs font-medium text-red-500 mt-1">{error}</p>}
                </div>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg text-xs font-semibold hover:bg-hover-blue transition-colors shadow-sm active:scale-95"
                >
                    <Plus size={16} strokeWidth={2.5} /> Add Question
                </button>
            </div>

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-card-bg p-6 rounded-xl border border-border-subtle shadow-sm space-y-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between gap-4 items-end">
                        <input
                            placeholder="Enter Question Text..."
                            className="flex-1 text-base font-semibold bg-transparent outline-none border-b border-border-subtle focus:border-accent-blue py-2 transition-colors text-text-main placeholder:font-normal"
                            value={q.question_text || ''}
                            onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                        />
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="text-text-muted hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-50">
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <select
                            className="w-full p-2.5 bg-app-bg text-text-main rounded-lg text-sm font-medium outline-none border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 transition-all"
                            value={q.question_type}
                            onChange={(e) => updateQuestionType(qIndex, e.target.value)}
                        >
                            <option value="MCQ">MCQ (Single Choice)</option>
                            <option value="BCQ">BCQ (Multiple Choice)</option>
                            <option value="SHORT">Short Answer</option>
                        </select>
                        <input
                            type="number"
                            className="w-full p-2.5 bg-app-bg text-text-main rounded-lg text-sm font-medium outline-none border border-border-subtle focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 transition-all"
                            placeholder="Marks"
                            value={q.marks || 0}
                            onChange={(e) => updateMarks(qIndex, Number(e.target.value))}
                        />
                    </div>

                    {q.question_type !== 'SHORT' && (
                        <div className="space-y-3 pl-2 border-l-2 border-border-subtle">
                            {q.options?.map((opt: any, oIndex: number) => (
                                <div key={oIndex} className="flex items-center gap-3 bg-app-bg p-2 rounded-lg border border-border-subtle">
                                    <input
                                        placeholder="Option Text..."
                                        className="flex-1 text-sm font-medium bg-transparent px-3 outline-none text-text-main"
                                        value={opt.option_text || ''}
                                        onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                                    />
                                    <div className="flex gap-1.5 pr-1">
                                        <button
                                            type="button"
                                            onClick={() => toggleCorrectOption(qIndex, oIndex)}
                                            title="Mark as correct"
                                            className={`p-1.5 rounded-md transition-colors ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-card-bg text-text-muted hover:bg-border-subtle border border-border-subtle'}`}
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                        <button type="button" onClick={() => removeOption(qIndex, oIndex)} className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => addOption(qIndex)} className="text-xs font-semibold text-accent-blue hover:text-hover-blue transition-colors ml-2 mt-2 flex items-center gap-1">
                                <Plus size={14} /> Add Option
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default QuizBuilderField;