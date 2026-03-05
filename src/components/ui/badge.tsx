import * as React from 'react';

import {cva, type VariantProps} from 'class-variance-authority';

import {cn} from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:focus:ring-gray-300',
	{
		variants: {
			variant: {
				default: 'border border-primary/20 bg-primary/15 text-primary',
				secondary: 'border border-gray-200 bg-gray-100 text-gray-800',
				success: 'border border-green-100 bg-green-100/60 text-green-600',
				destructive: 'border border-red-100 bg-red-100/60 text-red-700',
				outline: 'border border-gray-200 bg-transparent text-gray-800',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
	({className, variant, ...props}, ref) => (
		<div
			ref={ref}
			className={cn(badgeVariants({variant}), className)}
			{...props}
		/>
	),
);
Badge.displayName = 'Badge';

export {Badge, badgeVariants};
