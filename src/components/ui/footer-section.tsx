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
		<footer className="relative w-full max-w-5xl mx-auto flex flex-col items-center justify-center rounded-t-[2rem] border-t border-white/[0.08] bg-[radial-gradient(40%_120px_at_50%_0%,rgba(255,255,255,0.06),transparent)] px-6 py-14 lg:py-16">
			<div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-sm" />

			<div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
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
					<p className="text-gray-500 mt-6 text-[13px] md:mt-0 max-w-xs leading-relaxed">
						South Africa’s trusted product sourcing platform.
					</p>
					<div className="flex items-center gap-4 pt-2">
						<Link href="#" className="text-gray-500 hover:text-white transition-colors">
							<Mail className="w-4 h-4" />
						</Link>
						<Link href="#" className="text-gray-500 hover:text-white transition-colors">
							<MapPin className="w-4 h-4" />
						</Link>
					</div>
				</AnimatedContainer>

				{/* Link Sections */}
				<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
					{footerLinks.map((section, index) => (
						<AnimatedContainer key={section.label} delay={0.1 + index * 0.1}>
							<div className="mb-10 md:mb-0">
								<h3 className="text-[11px] font-medium uppercase tracking-widest text-gray-500">{section.label}</h3>
								<ul className="mt-3 space-y-2 text-[13px] text-gray-500">
									{section.links.map((link) => (
										<li key={link.title}>
											<Link
												href={link.href}
												className="hover:text-white inline-flex items-center transition-all duration-300"
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
			<p className="mt-14 text-[12px] text-gray-600">
				© {new Date().getFullYear()} Roventis Sourcing. All rights reserved.
			</p>
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
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
