import Link from "next/link";

const footerLinks = {
    Product: ["/pricing", "/features", "/faq"],
    Company: ["/about", "/contact"],
    Legal: ["/privacy", "/terms", "/cookies"],
};

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mx-auto max-w-6xl px-6 py-12">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-7 w-7 rounded-lg bg-zinc-900 flex items-center justify-center dark:bg-zinc-100">
                                <span className="text-xs font-bold text-white dark:text-zinc-900">AI</span>
                            </div>
                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50">CMS</span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Build and deploy websites with natural language.
                        </p>
                    </div>
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">{title}</h4>
                            <ul className="space-y-2">
                                {links.map((href) => (
                                    <li key={href}>
                                        <Link href={href} className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors">
                                            {href.slice(1)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-sm text-white dark:text-white flex items-center justify-between">           </div>
                <span className="text-sm text-gray-400">&copy; 2026 AI Website CMS</span>
            </div>
        </footer>
    );
}
