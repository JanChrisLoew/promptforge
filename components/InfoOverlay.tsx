import React from 'react';
import { X, Shield, Info, Scale } from 'lucide-react';

export type InfoType = 'about' | 'impressum' | 'security';

interface InfoOverlayProps {
    type: InfoType;
    onClose: () => void;
}

export const InfoOverlay: React.FC<InfoOverlayProps> = ({ type, onClose }) => {
    const getContent = () => {
        switch (type) {
            case 'about':
                return {
                    title: 'About PromptForge',
                    icon: <Info className="text-accent-3" size={32} />,
                    content: (
                        <div className="space-y-4 text-txt-secondary leading-relaxed">
                            <p>
                                PromptForge was born out of the need for a professional, local-first environment for prompt engineers.
                                In an era where AI interactions are becoming core to software development, we believe the tools used to craft these interactions should be as robust as the IDEs we use for code.
                            </p>
                            <p>
                                Our mission is to provide a seamless, high-performance workspace that respects user privacy and data sovereignty while enabling advanced versioning and library management.
                            </p>
                            <div className="pt-4">
                                <h4 className="font-bold text-txt-primary mb-2">Philosophy</h4>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li><span className="font-bold">Privacy First</span>: Your data never leaves your machine unless you explicitly export it.</li>
                                    <li><span className="font-bold">Performance Centric</span>: No loading spinners, no latency—just pure engineering speed.</li>
                                    <li><span className="font-bold">Developer Experience</span>: Intuitive workflows and professional-grade features.</li>
                                </ul>
                            </div>
                        </div>
                    )
                };
            case 'impressum':
                return {
                    title: 'Impressum / Legal Notice',
                    icon: <Scale className="text-accent-2" size={32} />,
                    content: (
                        <div className="space-y-4 text-txt-secondary leading-relaxed">
                            <div>
                                <h4 className="font-bold text-txt-primary mb-1">Project Information</h4>
                                <p>PromptForge is an Open Source Project designed for professional prompt engineering workflows.</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-txt-primary mb-1">Developer</h4>
                                <p>Jan L. • Advanced Agentic Coding Team</p>
                                <p>Email: contact@promptforge.local</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-txt-primary mb-1">Disclaimer</h4>
                                <p>
                                    The software is provided "as is", without warranty of any kind, express or implied.
                                    Users are responsible for the content generated and managed within the application.
                                </p>
                            </div>
                        </div>
                    )
                };
            case 'security':
                return {
                    title: 'Security & Privacy',
                    icon: <Shield className="text-accent-1" size={32} />,
                    content: (
                        <div className="space-y-4 text-txt-secondary leading-relaxed">
                            <p>
                                Security is not an afterlife—it's the core of PromptForge. Because we are a **Local-First** application, your security profile is tied directly to your local environment.
                            </p>
                            <div className="grid grid-cols-1 gap-4 pt-2">
                                <div className="p-4 bg-canvas-base border border-color-border rounded-xl">
                                    <h5 className="font-bold text-txt-primary mb-1">Zero Cloud Dependency</h5>
                                    <p className="text-sm">We do not use an external database. All prompts and versions are stored in your browser's IndexedDB.</p>
                                </div>
                                <div className="p-4 bg-canvas-base border border-color-border rounded-xl">
                                    <h5 className="font-bold text-txt-primary mb-1">Data Sovereignty</h5>
                                    <p className="text-sm">You own your data. Our export/import system uses plain JSON, ensuring you can move your library whenever you want.</p>
                                </div>
                                <div className="p-4 bg-canvas-base border border-color-border rounded-xl">
                                    <h5 className="font-bold text-txt-primary mb-1">No Tracking</h5>
                                    <p className="text-sm">PromptForge includes zero telemetery or tracking scripts. Your prompting patterns remain your business.</p>
                                </div>
                            </div>
                        </div>
                    )
                };
        }
    };

    const { title, icon, content } = getContent();

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-canvas-base/60 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-canvas-card border border-color-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between p-8 border-b border-color-border bg-canvas-card/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-canvas-base rounded-2xl border border-color-border shadow-inner">
                            {icon}
                        </div>
                        <h2 className="text-3xl font-black text-txt-primary tracking-tight">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-txt-muted hover:text-accent-1 hover:bg-accent-1/10 rounded-xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {content}
                </div>

                <div className="p-6 bg-canvas-base/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-canvas-card border border-color-border text-txt-primary font-bold rounded-xl hover:bg-canvas-hover transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
