import React from "react";
import { Link } from "react-router-dom";
import Button from "@/components/ui/button/Button";
import { MdKeyboardArrowLeft } from "react-icons/md";

export interface TombolAksi {
    label: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "outline" | "secondary";
    className?: string;
    disabled?: boolean;
    href?: string;
}

interface HeaderAksiProps {
    judul: string;
    urlKembali: string | (() => void);
    tombolAksi?: TombolAksi[];
    loading?: boolean;
}

export default function HeaderAksi({ 
    judul, 
    urlKembali, 
    tombolAksi = [], 
    loading = false 
}: HeaderAksiProps) {
    const renderTombolKembali = () => {
        const tombol = (
            <Button
                variant="outline"
                className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                onClick={typeof urlKembali === 'function' ? urlKembali : undefined}
            >
                <MdKeyboardArrowLeft size={20} />
            </Button>
        );

        // Jika urlKembali adalah string, wrap dengan Link
        if (typeof urlKembali === 'string') {
            return (
                <Link to={urlKembali}>
                    {tombol}
                </Link>
            );
        }

        // Jika urlKembali adalah function, return button dengan onClick
        return tombol;
    };

    return (
        <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-1">
                {renderTombolKembali()}
                <div className="border-l border-gray-300 h-6 mx-3"></div>
                <h1 className="ms-2 font-primary-bold font-normal text-xl">
                    {judul}
                </h1>
            </div>
            
            {/* Action Buttons */}
            {tombolAksi.length > 0 && (
                <div className="flex gap-3">
                    {tombolAksi.map((tombol, index) => {
                        const buttonContent = (
                            <Button
                                key={index}
                                className={`group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 font-secondary py-2 ${tombol.className || ""}`}
                                onClick={tombol.onClick}
                                disabled={loading || tombol.disabled}
                            >
                                {tombol.icon && tombol.icon}
                                {tombol.label}
                            </Button>
                        );

                        // Jika ada href, wrap dengan Link
                        if (tombol.href) {
                            return (
                                <Link key={index} to={tombol.href}>
                                    {buttonContent}
                                </Link>
                            );
                        }

                        return buttonContent;
                    })}
                </div>
            )}
        </div>
    );
}