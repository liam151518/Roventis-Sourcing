'use client';

import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { InstagramIcon, YoutubeIcon, Mail, MapPin } from 'lucide-react';
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
			{ title: 'Features', href: '#benefits' },
			{ title: 'How It Works', href: '#how' },
			{ title: 'Earnings', href: '#earnings' },
			{ title: 'FAQ', href: '#faq' },
		],
	},
	{
		label: 'Legal',
		links: [
			{ title: 'Privacy Policy', href: '/privacy' },
			{ title: 'Terms of Service', href: '/terms' },
			{ title: 'Cookie Policy', href: '/cookies' },
			{ title: 'Affiliate Agreement', href: '/affiliate-agreement' },
		],
	},
	{
		label: 'Company',
		links: [
			{ title: 'About Us', href: '/about' },
			{ title: 'Disclaimer', href: '/disclaimer' },
			{ title: 'Contact', href: 'mailto:roventis.io@gmail.com' },
		],
	},
	{
		label: 'Social',
		links: [
			{ title: 'Instagram', href: 'https://www.instagram.com/roventis.co.za?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', icon: InstagramIcon },
			{ title: 'Youtube', href: 'http://www.youtube.com/@RoventisGear', icon: YoutubeIcon },
		],
	},
];

export function Footer() {
	return (
		<footer className="relative w-full bg-[#faf9f7] pt-20 pb-10 z-10">
			{/* Top divider that goes full width edge-to-edge */}
			<div className="w-full h-px bg-black/5 mb-16" />

			<div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
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
										{section.links.map((link) => {
											const isExternal = /^https?:\/\//i.test(link.href);
											return (
												<li key={link.title}>
													<Link
														href={link.href}
														className="text-[13px] text-[#6e6e73] hover:text-[#1d1d1f] inline-flex items-center transition-colors"
														{...(isExternal
															? { target: '_blank' as const, rel: 'noopener noreferrer' }
															: {})}
													>
														{link.icon && <link.icon className="mr-1.5 w-3.5 h-3.5" />}
														{link.title}
													</Link>
												</li>
											);
										})}
									</ul>
								</div>
							</AnimatedContainer>
						))}
					</div>
				</div>
			</div>

			{/* Giant brand watermark */}
			<div className="relative w-full mt-20 mb-8 overflow-hidden select-none pointer-events-none">
				<div className="text-center text-[clamp(4rem,18vw,16rem)] font-semibold leading-none tracking-[-0.05em] bg-gradient-to-b from-[#1d1d1f]/10 to-transparent bg-clip-text text-transparent">
					ROVENTIS
				</div>
			</div>

			{/* Bottom bar — full width edge to edge */}
			<div className="w-full border-t border-black/5">
				<div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-[12px] text-[#86868b]">
						© {new Date().getFullYear()} Roventis Sourcing. All rights reserved.
					</p>
					<div className="flex items-center gap-6 text-[12px] text-[#86868b]">
						<Link href="/privacy" className="hover:text-[#1d1d1f] transition-colors">Privacy</Link>
						<Link href="/terms" className="hover:text-[#1d1d1f] transition-colors">Terms</Link>
						<Link href="/cookies" className="hover:text-[#1d1d1f] transition-colors">Cookies</Link>
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