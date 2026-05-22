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
		<footer className="relative w-full bg-[#faf9f7] px-6 pt-20 pb-12 z-10">
			<div className="max-w-6xl mx-auto">
				{/* Top: brand + columns */}
				<div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
					{/* Brand Section */}
					<AnimatedContainer className="lg:col-span-4 space-y-4">
						<Link href="/" className="flex items-center">
							<Image
								src="/roventis-logo.png"
								alt="Roventis"
								width={120}
								height={28}
								className="h-7 w-auto"
							/>
						</Link>
						<p className="text-[14px] text-[#6e6e73] max-w-xs leading-relaxed">
							South Africa's trusted product sourcing platform. Built for hustlers, designed for scale.
						</p>
						<div className="flex items-center gap-3 pt-2">
							<Link href="#" className="w-9 h-9 rounded-full bg-white border border-black/5 flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors">
								<Mail className="w-4 h-4" />
							</Link>
							<Link href="#" className="w-9 h-9 rounded-full bg-white border border-black/5 flex items-center justify-center text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-black/5 transition-colors">
								<MapPin className="w-4 h-4" />
							</Link>
						</div>
					</AnimatedContainer>

					{/* Link Sections */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:col-span-8">
						{footerLinks.map((section, index) => (
							<AnimatedContainer key={section.label} delay={0.1 + index * 0.08}>
								<div>
									<h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#1d1d1f]">{section.label}</h3>
									<ul className="mt-4 space-y-3">
										{section.links.map((link) => (
											<li key={link.title}>
												<Link
													href={link.href}
													className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f] inline-flex items-center transition-colors"
												>
													{link.icon && <link.icon className="mr-1.5 w-3.5 h-3.5" />}
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

				{/* Divider */}
				<div className="mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-[12px] text-[#86868b]">
						© {new Date().getFullYear()} Roventis Sourcing. All rights reserved.
					</p>
					<div className="flex items-center gap-6 text-[12px] text-[#86868b]">
						<Link href="#" className="hover:text-[#1d1d1f] transition-colors">Privacy</Link>
						<Link href="#" className="hover:text-[#1d1d1f] transition-colors">Terms</Link>
						<Link href="#" className="hover:text-[#1d1d1f] transition-colors">Cookies</Link>
					</div>
				</div>
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