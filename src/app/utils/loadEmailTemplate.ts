import fs from 'fs';
import path from 'path';

export const loadEmailTemplate = (templateName: string, replacements: { [key: string]: string }): string => {
    const templatePath = path.join(__dirname, '../../views/emailTemplates', `${templateName}.html`);
    let template = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(replacements)) {
        template = template.replace(`{{${key}}}`, value);
    }
    return template;
};
