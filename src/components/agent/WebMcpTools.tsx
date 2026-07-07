'use client';

/**
 * WebMCP tool registration — exposes the site's key actions to in-browser
 * AI agents via `navigator.modelContext.provideContext()` (WebMCP, W3C Web
 * Machine Learning WG incubation; shipped behind Chrome's early preview).
 *
 * Feature-detected: a no-op everywhere the API is absent, so it adds no
 * behavior for regular visitors. Rendered once from the root layout with a
 * build-time product digest passed in as props.
 */

import { useEffect } from 'react';

export interface WebMcpProduct {
  slug: string;
  name: string;
  category: string;
}

interface McpToolResult {
  content: Array<{ type: 'text'; text: string }>;
}

interface McpToolDescriptor {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<McpToolResult>;
}

interface ModelContext {
  provideContext: (context: { tools: McpToolDescriptor[] }) => void;
}

const INQUIRY_SUBJECTS = ['general', 'sales', 'export', 'press'] as const;

export default function WebMcpTools({ products }: { products: WebMcpProduct[] }) {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
    if (typeof modelContext?.provideContext !== 'function') return;

    modelContext.provideContext({
      tools: [
        {
          name: 'list_products',
          description:
            'List the frozen vegetable and fruit products Montana Frozen Foods exports. Returns slug, English name, category, and the URL of each product detail page (varieties, packaging, seasonality, nutrition).',
          inputSchema: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description:
                  'Optional category filter, e.g. "leaf", "vegetable", "fruit". Omit to list everything.',
              },
            },
          },
          async execute(args) {
            const category = typeof args.category === 'string' ? args.category : undefined;
            const matches = category ? products.filter((p) => p.category === category) : products;
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    matches.map((p) => ({
                      ...p,
                      url: `${window.location.origin}/en/catalog/${p.slug}`,
                    })),
                  ),
                },
              ],
            };
          },
        },
        {
          name: 'submit_business_inquiry',
          description:
            'Send a business, sales, export, or press inquiry to the Montana Frozen Foods sales team. The team replies to the given email address. Only use this on behalf of a real person or organization that has agreed to be contacted.',
          inputSchema: {
            type: 'object',
            required: ['name', 'email', 'subject', 'message', 'consent'],
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 100 },
              email: { type: 'string', format: 'email', maxLength: 200 },
              company: { type: 'string', description: 'Optional company name.' },
              subject: { type: 'string', enum: [...INQUIRY_SUBJECTS] },
              message: { type: 'string', minLength: 10, maxLength: 5000 },
              consent: {
                type: 'boolean',
                const: true,
                description:
                  'Must be true — confirms the sender consents to Montana processing this data to answer the inquiry.',
              },
            },
          },
          async execute(args) {
            const res = await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: args.name,
                email: args.email,
                company: args.company,
                subject: args.subject,
                message: args.message,
                consent: args.consent === true,
              }),
            });
            const body = await res.text();
            return {
              content: [
                {
                  type: 'text',
                  text: res.ok
                    ? 'Inquiry submitted — the Montana sales team will reply by email.'
                    : `Submission failed (HTTP ${res.status}): ${body}`,
                },
              ],
            };
          },
        },
      ],
    });
  }, [products]);

  return null;
}
