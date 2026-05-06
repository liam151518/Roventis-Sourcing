'use client';

import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FacebookIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface FooterLink {
	title: string;
	href: string;
	icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

const footerLinks: FooterSection[] = [
	{
		label: 'Product',
		links: [
			{ title: 'Features', href: '#' },
			{ title: 'Pricing', href: '#' },
			{ title: 'Testimonials', href: '#' },
			{ title: 'Integration', href: '#' },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'FAQs', href: '#faq' },
			{ title: 'About Us', href: '#' },
			{ title: 'Privacy Policy', href: '#' },
			{ title: 'Terms of Service', href: '#' },
		],
	},
	{
		label: 'Resources',
		links: [
			{ title: 'Blog', href: '#' },
			{ title: 'Changelog', href: '#' },
			{ title: 'Brand', href: '#' },
			{ title: 'Help', href: '#' },
		],
	},
	{
		label: 'Social Links',
		links: [
			{ title: 'Facebook', href: '#', icon: FacebookIcon },
			{ title: 'Instagram', href: '#', icon: InstagramIcon },
			{ title: 'Youtube', href: '#', icon: YoutubeIcon },
			{ title: 'LinkedIn', href: '#', icon: LinkedinIcon },
		],
	},
];

export function Footer() {
	return (
		<footer className="relative w-full border-t border-white/[0.06] bg-[#050508] px-6 py-14 lg:py-16">
			<div className="max-w-7xl mx-auto px-6 lg:px-12">
				<div className="grid w-full gap-8 lg:grid-cols-3 lg:gap-8">
					{/* Brand Section */}
					<AnimatedContainer className="space-y-4">
						<Link href="/" className="flex items-center gap-2.5">
							<Image
								src="/roventis-logo.png"
								alt="Roventis"
								width={120}
								height={28}
								className="h-7 w-auto object-contain object-left"
							/>
						</Link>
						<p className="text-slate-500 text-[13px] mt-4 max-w-xs leading-relaxed">
							South Africa's trusted product sourcing platform.
						</p>
						<div className="flex items-center gap-4 pt-2">
							<Link href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
								<Mail className="w-4 h-4" />
							</Link>
							<Link href="#" className="text-slate-500 hover:text-slate-300 transition-colors">
								<MapPin className="w-4 h-4" />
							</Link>
						</div>
					</AnimatedContainer>

					{/* Link Sections */}
					<div className="mt-10 grid grid-cols-2 gap-8 lg:col-span-2 lg:mt-0">
						{footerLinks.map((section, index) => (
							<AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
								<div className="mb-8 lg:mb-0">
									<h3 className="text-[11px] font-medium uppercase tracking-widest text-slate-500">{section.label}</h3>
									<ul className="mt-3 space-y-2 text-[13px] text-slate-500">
										{section.links.map((link) => (
											<li key={link.title}>
												<Link
													href={link.href}
													className="hover:text-slate-300 inline-flex items-center transition-colors text-sm"
												>
													{link.icon && <link.icon className="mr-1 w-4 h-4" />}
													{link.title}
												</Link>
											</li>
										))}
									</ul>
								</div>
							</AnimatedContainer>
						))}
					</div>
				</div>

				{/* Copyright */}
				<p className="mt-12 text-xs text-slate-600">
					© {new Date().getFullYear()} Roventis Sourcing. All rights reserved.
				</p>
			</div>
		</footer>
	);
}

type ViewAnimationProps = {
	delay?: number;
	className?: ComponentProps<typeof motion.div>['className'];
	children: ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.6 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}