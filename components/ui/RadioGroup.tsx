"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        value?: string;
        onValueChange?: (value: string) => void;
    }
>(({ className, value, onValueChange, children, ...props }, ref) => {
    return (
        <div role="radiogroup" ref={ref} className={cn("grid gap-2", className)} {...props}>
            {/* Pass down props to children if needed, or rely on context. 
            For simplicity in this non-Radix version, we'll use a Context. 
        */}
            <RadioGroupContext.Provider value={{ value, onValueChange }}>
                {children}
            </RadioGroupContext.Provider>
        </div>
    );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
}>({});

const RadioGroupItem = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const checked = context.value === value;

    return (
        <button
            type="button"
            role="radio"
            aria-checked={checked}
            data-state={checked ? "checked" : "unchecked"}
            value={value}
            className={cn(
                "aspect-square h-4 w-4 rounded-full border border-primary text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            onClick={() => context.onValueChange?.(value)}
            ref={ref}
            {...props}
        >
            {/* Indicator */}
        </button>
    );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
