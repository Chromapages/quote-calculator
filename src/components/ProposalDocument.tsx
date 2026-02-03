'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

export type ProposalPricingItem = {
  label: string;
  detail?: string;
  amount: number;
};

export type ProposalTimelineItem = {
  phase: string;
  duration: string;
  details: string;
};

export type ProposalData = {
  proposalNumber: string;
  dates: {
    proposalDate: string;
    validUntil: string;
  };
  brand: {
    name: string;
    tagline: string;
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  client: {
    company: string;
    contact: string;
    email: string;
    location: string;
  };
  project: {
    name: string;
    summary: string;
    goals: string[];
    deliverables: string[];
  };
  pricing: {
    items: ProposalPricingItem[];
    min: number;
    max: number;
    notes: string;
    paymentSchedule: string[];
  };
  timeline: ProposalTimelineItem[];
  terms: string[];
};

const colors = {
  ink: '#102226',
  muted: '#4b5d64',
  accent: '#1f4e5f',
  accentSoft: '#e8f0f1',
  line: '#d7e2e3',
  paper: '#fdfbf7',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.paper,
    color: colors.ink,
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logoPlaceholder: {
    width: 120,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandName: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 0.4,
  },
  brandTagline: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 9,
  },
  headerMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  metaLabel: {
    fontSize: 9,
    color: colors.muted,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 600,
  },
  titleBlock: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.accentSoft,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: colors.muted,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.3,
    marginBottom: 8,
    color: colors.accent,
    textTransform: 'uppercase',
  },
  twoCol: {
    flexDirection: 'row',
    gap: 16,
  },
  col: {
    flex: 1,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  infoLabel: {
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 600,
  },
  list: {
    gap: 6,
  },
  listRow: {
    flexDirection: 'row',
    gap: 6,
  },
  bullet: {
    fontSize: 10,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    color: colors.ink,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.accentSoft,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tableLabel: {
    fontSize: 10,
    fontWeight: 600,
  },
  tableDetail: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 2,
  },
  tableValue: {
    fontSize: 10,
    fontWeight: 600,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: '#ffffff',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.accent,
  },
  note: {
    fontSize: 9,
    color: colors.muted,
    marginTop: 6,
  },
  timelineCard: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  timelinePhase: {
    fontSize: 10,
    fontWeight: 700,
    minWidth: 120,
  },
  timelineDetail: {
    fontSize: 9,
    color: colors.muted,
    flex: 1,
  },
  termsBlock: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: colors.muted,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export function ProposalDocument({ data }: { data: ProposalData }) {
  const { brand, client, project, pricing, timeline, terms, dates, proposalNumber } =
    data;
  const mid = Math.round((pricing.min + pricing.max) / 2);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <View style={styles.logoPlaceholder}>
              <Text>Chromapages Logo</Text>
            </View>
            <Text style={styles.brandName}>{brand.name}</Text>
            <Text style={styles.brandTagline}>{brand.tagline}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.metaLabel}>Proposal</Text>
            <Text style={styles.metaValue}>#{proposalNumber}</Text>
            <Text style={styles.metaLabel}>Prepared</Text>
            <Text style={styles.metaValue}>{dates.proposalDate}</Text>
            <Text style={styles.metaLabel}>Valid Until</Text>
            <Text style={styles.metaValue}>{dates.validUntil}</Text>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>{project.name}</Text>
          <Text style={styles.subtitle}>{project.summary}</Text>
        </View>

        <View style={[styles.section, styles.twoCol]}>
          <View style={[styles.col, styles.infoCard]}>
            <Text style={styles.infoLabel}>Prepared For</Text>
            <Text style={styles.infoValue}>{client.company}</Text>
            <Text>{client.contact}</Text>
            <Text>{client.email}</Text>
            <Text>{client.location}</Text>
          </View>
          <View style={[styles.col, styles.infoCard]}>
            <Text style={styles.infoLabel}>Prepared By</Text>
            <Text style={styles.infoValue}>{brand.name}</Text>
            <Text>{brand.email}</Text>
            <Text>{brand.phone}</Text>
            <Text>{brand.website}</Text>
            <Text>{brand.address}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Goals</Text>
          <View style={styles.list}>
            {project.goals.map((goal) => (
              <View style={styles.listRow} key={goal}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scope & Deliverables</Text>
          <View style={styles.list}>
            {project.deliverables.map((item) => (
              <View style={styles.listRow} key={item}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Line Item</Text>
              <Text style={styles.tableHeaderText}>Amount</Text>
            </View>
            {pricing.items.map((item) => (
              <View style={styles.tableRow} key={item.label}>
                <View>
                  <Text style={styles.tableLabel}>{item.label}</Text>
                  {item.detail ? (
                    <Text style={styles.tableDetail}>{item.detail}</Text>
                  ) : null}
                </View>
                <Text style={styles.tableValue}>{formatCurrency(item.amount)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimated Investment</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(pricing.min)} - {formatCurrency(pricing.max)}
              </Text>
            </View>
          </View>
          <Text style={styles.note}>{pricing.notes}</Text>
        </View>

        <View style={[styles.section, styles.twoCol]}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineCard}>
              {timeline.map((step) => (
                <View style={styles.timelineRow} key={step.phase}>
                  <Text style={styles.timelinePhase}>{step.phase}</Text>
                  <Text style={styles.timelineDetail}>{step.duration}</Text>
                  <Text style={styles.timelineDetail}>{step.details}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Payment Schedule</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Estimated Midpoint</Text>
              <Text style={styles.infoValue}>{formatCurrency(mid)}</Text>
              <View style={styles.list}>
                {pricing.paymentSchedule.map((line) => (
                  <View style={styles.listRow} key={line}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listText}>{line}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <View style={styles.termsBlock}>
            <View style={styles.list}>
              {terms.map((term) => (
                <View style={styles.listRow} key={term}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.listText}>{term}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptance</Text>
          <Text>
            To accept this proposal, please reply with written approval. A formal
            statement of work will be issued upon deposit receipt.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            {brand.website} · {brand.email}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}
