document.addEventListener('DOMContentLoaded', () => {
    const btn = document.querySelector('.nav-toggle-bottom');
    const sidebar = document.getElementById('sidebar');

    if (!btn || !sidebar) {
        console.warn('Sidebar toggle elements not found');
        return;
    }

    const isMobile = () => window.matchMedia('(max-width: 720px)').matches;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isMobile()) {
            sidebar.classList.toggle('open');
        } else {
            sidebar.classList.toggle('collapsed');
        }
    });

    document.addEventListener('click', (e) => {
        if (isMobile() && sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) && !btn.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });

    window.addEventListener('resize', () => {
        if (!isMobile()) {
            sidebar.classList.remove('open');
        }
    });
});

const DocX = {
    settings: {
        version: 2.1,
    },
    init: function (heading_color = '#333', para_color = '#444', pri_color = '#007bff', sec_color = '#6c757d') {
        const textCanvasElements = document.querySelectorAll('.docx-canvas');
        if (!textCanvasElements.length) {
            console.warn('No .docx-canvas elements found');
            return;
        }

        textCanvasElements.forEach((element) => {
            try {
                let text = element.innerHTML || '';

                // Code blocks: Process first to avoid interference
                text = text.replace(/```([a-z]*)\n([\s\S]*?)\n```/gm, (match, lang, code) => {
                    // Escape HTML characters to prevent rendering issues
                    let codeHtml = code
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    let highlightedCode = codeHtml;
                    const language = lang.trim().toLowerCase();

                    try {
                        if (language === 'javascript' || language === 'js') {
                            // Process line by line to handle comments properly
                            const lines = codeHtml.split('\n');
                            const processedLines = lines.map(line => {
                                // Check if line starts with // (after optional whitespace)
                                if (/^\s*\/\//.test(line)) {
                                    // Entire line is a comment, no further processing
                                    return '<span style="color:#6A9955;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">' + line + '</span>';
                                }

                                // Process non-comment lines with full syntax highlighting
                                let processedLine = line
                                    // Multi-line comments first
                                    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6A9955;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Template literals with expressions (handle before regular strings)
                                    .replace(/(`[^`]*?`)/g, '<span style="color:#CE9178;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Regular strings (single, double) - more precise pattern
                                    .replace(/(?<!<[^>]*?)('(?:[^'\\]|\\.)*?')|(?<!<[^>]*?)("(?:[^"\\]|\\.)*?")/g,
                                        '<span style="color:#CE9178;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1$2</span>')
                                    // Keywords (avoid matching inside spans)
                                    .replace(/(?<!<[^>]*?)\b(const|let|var|function|return|if|else|for|while|class|import|export|from|new|this|break|continue|switch|case|default|try|catch|finally|throw|async|await)\b(?![^<]*?>)/g,
                                        '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Numbers (avoid matching inside spans)
                                    .replace(/(?<!<[^>]*?)\b(\d+(?:\.\d+)?)\b(?![^<]*?>)/g, '<span style="color:#B5CEA8;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Function calls (avoid matching after & or inside spans)
                                    .replace(/(?<!&|<[^>]*?)(\w+)(\s*\()(?![^<]*?>)/g, '<span style="color:#DCDCAA;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>$2')
                                    // Object properties (avoid matching after & or inside spans)
                                    .replace(/(?<!&|<[^>]*?)(\.\w+)\b(?![^<]*?>)/g, '<span style="color:#9CDCFE;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Boolean and null values (avoid matching inside spans)
                                    .replace(/(?<!<[^>]*?)\b(true|false|null|undefined)\b(?![^<]*?>)/g, '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Special Node.js globals (avoid matching inside spans)
                                    .replace(/(?<!<[^>]*?)\b(__dirname|__filename|module|exports|require|process|global)\b(?![^<]*?>)/g,
                                        '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>');

                                return processedLine;
                            });

                            highlightedCode = processedLines.join('\n')
                                // Finally, escape ${} expressions in template literals to prevent HTML conflicts
                                .replace(/\${/g, '&#36;{');
                        } else if (language === 'java') {
                            // Process line by line to handle comments properly
                            const lines = codeHtml.split('\n');
                            const processedLines = lines.map(line => {
                                // Check if line starts with // (after optional whitespace)
                                if (/^\s*\/\//.test(line)) {
                                    // Entire line is a comment, no further processing
                                    return '<span style="color:#6A9955;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">' + line + '</span>';
                                }

                                // Process non-comment lines with full syntax highlighting
                                let processedLine = line
                                    // Multi-line comments first
                                    .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6A9955;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Strings (single, double) - more precise pattern
                                    .replace(/(?<!<[^>]*?)('(?:[^'\\]|\\.)*?')|(?<!<[^>]*?)("(?:[^"\\]|\\.)*?")/g,
                                        '<span style="color:#CE9178;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1$2</span>')
                                    // Keywords (avoid matching inside spans)
                                    .replace(/(?<!<[^>]*?)\b(public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|new|this|super|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|void|int|double|float|long|short|byte|char|boolean|String)\b(?![^<]*?>)/g,
                                        '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Numbers (avoid matching inside spans)
                                    .replace(/(?<!<[^>]*?)\b(\d+(?:\.\d+)?)\b(?![^<]*?>)/g, '<span style="color:#B5CEA8;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Function calls (avoid matching after & or inside spans)
                                    .replace(/(?<!&|<[^>]*?)(\w+)(\s*\()(?![^<]*?>)/g, '<span style="color:#DCDCAA;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>$2')
                                    // Object properties (avoid matching after & or inside spans)
                                    .replace(/(?<!&|<[^>]*?)(\.\w+)\b(?![^<]*?>)/g, '<span style="color:#9CDCFE;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                    // Boolean and null values (avoid matching inside spans)
                                    .replace(/(?<!<[^>]*?)\b(true|false|null)\b(?![^<]*?>)/g, '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>');

                                return processedLine;
                            });

                            highlightedCode = processedLines.join('\n')
                                // Finally, escape ${} expressions to prevent HTML conflicts
                                .replace(/\${/g, '&#36;{');
                        } else if (language === 'html') {
                            highlightedCode = codeHtml
                                .replace(/(<\/?\w+)([^&]*?)(>)/g, '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span><span style="color:#9CDCFE;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$2</span><span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$3</span>')
                                .replace(/(\s+\w+)=("[^"]*")/g, '<span style="color:#9CDCFE;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>=<span style="color:#CE9178;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$2</span>');
                        } else if (language === 'css') {
                            highlightedCode = codeHtml
                                .replace(/([\.\#]?[\w\-]+)(\s*\{)/g, '<span style="color:#D7BA7D;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>$2')
                                .replace(/(\s+)([\w\-]+)(\s*:)/g, '$1<span style="color:#9CDCFE;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$2</span>$3')
                                .replace(/(\:\s*)([\w\-\#]+)(;|\s|$)/g, '$1<span style="color:#CE9178;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$2</span>$3');
                        } else if (language === 'python') {
                            highlightedCode = codeHtml
                                .replace(/(#.*?)(\n|$)/g, '<span style="color:#6A9955;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>$2')
                                .replace(/('(?:[^'\\]|\\[^'])*?')|("(?:[^"\\]|\\[^"])*?")/g,
                                    '<span style="color:#CE9178;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1$2</span>')
                                .replace(/\b(def|class|import|from|as|return|if|elif|else|for|while|in|with|try|except|finally|raise|True|False|None|lambda|global|nonlocal|pass|break|continue)\b/g,
                                    '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                .replace(/\b(\d+)\b/g, '<span style="color:#B5CEA8;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                .replace(/([^&])(\w+)(\s*\()/g, '$1<span style="color:#DCDCAA;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$2</span>$3');
                        } else if (language === 'json') {
                            highlightedCode = codeHtml
                                // Strings with quotes
                                .replace(/("(?:[^"\\]|\\[^"])*?")/g, '<span style="color:#CE9178;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                // Property names with quotes
                                .replace(/("(?:[^"\\]|\\[^"])*?")(\s*:)/g, '<span style="color:#9CDCFE;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>$2')
                                // Numbers
                                .replace(/(?<!")\b(\d+(?:\.\d+)?)\b(?!")/g, '<span style="color:#B5CEA8;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>')
                                // Boolean and null values
                                .replace(/\b(true|false|null)\b/g, '<span style="color:#569CD6;font-family:\'JetBrains Mono\',JetBrains Mono,monospace;">$1</span>');
                        }
                    } catch (error) {
                        console.warn(`Syntax highlighting error for ${language}:`, error);
                    }

                    // Replace newlines with <br> for display
                    highlightedCode = highlightedCode.replace(/\n/g, '<br>');
                    return language
                        ? `<div style="position:relative;"><span style="position:absolute;top:0;right:0;background:#333;color:#ccc;padding:0 6px;border-radius:0 5px 0 5px;font-size:12px;font-family:sans-serif;">${language}</span><pre class="docx-no-wrap" style="background:#1E1E1E;padding:16px;border-radius:6px;overflow-x:auto;"><code style="line-height:1.5;font-family:'JetBrains Mono',JetBrains Mono,monospace;color:#E6E6FA;display:block;white-space:pre-wrap;">${highlightedCode}</code></pre></div>`
                        : `<pre class="docx-no-wrap" style="background:#1E1E1E;padding:16px;border-radius:6px;overflow-x:auto;"><code style="line-height:1.5;font-family:'JetBrains Mono',JetBrains Mono,monospace;color:#E6E6FA;display:block;white-space:pre-wrap;">${codeHtml.replace(/\n/g, '<br>')}</code></pre>`;
                });

                // Headings
                // # for h1, ## for h2, ### for h3
                text = text.replace(/^#\s+(.*?)$/gm, `<h1 style="margin-bottom: 1em;color: ${heading_color};font-size: 2.2rem;font-weight: bold;">$1</h1>`);
                text = text.replace(/^##\s+(.*?)$/gm, `<h2 style="margin-bottom: 1em;color: ${heading_color};font-size: 1.7rem;font-weight: bold;">$1</h2>`);
                text = text.replace(/^###\s+(.*?)$/gm, `<h3 style="margin-bottom: 1em;color: ${heading_color};font-size: 1.35rem;font-weight: bold;">$1</h3>`);

                // Blockquotes
                text = text.replace(/^>\s?(.*)$/gm, `<div class="docx-blockquote" style="border-left: 4px solid ${sec_color};padding-left: 1em;color: ${para_color};">$1</div>`);

                // Media
                text = text.replace(/^image:(\S+)$/gm, `<div class="docx-media-container"><img src="$1" alt="Image" class="docx-img" style="max-width:100%;height:auto;"></div>`);
                text = text.replace(/^video:(\S+)$/gm, `<div class="docx-media-container"><video src="$1" controls class="docx-video" style="max-width:100%;"></video></div>`);
                text = text.replace(/^audio:(\S+)$/gm, `<div class="docx-media-container"><audio src="$1" controls class="docx-audio"></audio></div>`);

                // Horizontal rule
                text = text.replace(/^---+$/gm, `<hr style="border:0;border-top:1.5px solid ${sec_color};margin:1.5em 0;">`);

                // Inline markdown
                text = text.replace(/\*\*\*(.*?)\*\*\*/g, `<b style="color:${sec_color};font-weight:bold;">$1</b>`);
                text = text.replace(/\*\*(.*?)\*\*/g, `<b style="color:${para_color};font-weight:bold;">$1</b>`);
                text = text.replace(/\_(.*?)\_/g, `<i style="color:${para_color};">$1</i>`);
                text = text.replace(/\[(.*?)\]\((.*?)\)/g, `<a href="$2" target="_blank" style="color:${heading_color};text-decoration:underline;">$1</a>`);

                // Inline code
                text = text.replace(/`([^`]+)`/g, `<code style="background:#222;padding:2px 6px;border-radius:4px;font-family:'JetBrains Mono',JetBrains Mono,monospace;color:#E6E6FA;">$1</code>`);

                // Lists
                text = text.replace(/(^(?:[-*]\s+.*(?:\n|$))+)/gm, (match) => {
                    const items = match.trim().split(/\n/).map(line => line.replace(/^[-*]\s+(.*)/, '<li>$1</li>')).join('');
                    return `<ul style="margin:1em 0 1em 1.5em;list-style:disc;color:${para_color};">${items}</ul>`;
                });

                // Wrap paragraphs (avoid wrapping already processed elements)
                text = text.split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        return /<h3|<p|<ul|<div class="docx-blockquote"|<div class="docx-media-container"|<hr|<pre/.test(line)
                            ? line
                            : `<p style="margin-bottom:1em;color:${para_color};font-size:1.05rem;line-height:1.5;letter-spacing:0.45px;">${line}</p>`;
                    })
                    .join('');

                element.innerHTML = text;
            } catch (error) {
                console.error('DocX processing error:', error);
                element.innerHTML = 'Error processing content';
            }
        });
    }
};