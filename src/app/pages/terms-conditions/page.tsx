import PolicyPage from '@/components/Content/PolicyPage'

const TermsConditionsPage = () => (
    <PolicyPage
        breadcrumb="Terms & Conditions"
        eyebrow="THE AGREEMENT"
        title="Clear terms. Strong foundations."
        intro="By accessing or using the Inner Beast website and placing an order, you agree to the following terms and conditions."
        image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=85"
        imageAlt="Terms and business documents on a desk"
        lastUpdated="July 2025"
        sections={[
            {
                title: 'Eligibility',
                paragraphs: ['You must be at least 18 years old, or have permission from a parent or guardian, to place an order with us. By ordering, you confirm that the information you provide is accurate and complete.'],
            },
            {
                title: 'Pricing & Payment',
                bullets: [
                    'All prices are displayed in the applicable currency and include VAT where required.',
                    'We reserve the right to update product prices at any time.',
                    'Payment must be completed in full before an order is dispatched.',
                ],
            },
            {
                title: 'Products & Availability',
                bullets: [
                    'Product images are for illustration purposes and colours may vary slightly depending on your device.',
                    'All products are subject to availability and may sell out or be discontinued.',
                    'We reserve the right to refuse or cancel any order due to pricing errors, suspected fraud, or stock availability.',
                ],
            },
            {
                title: 'Orders',
                paragraphs: ['Once your order is placed, you will receive a confirmation email. This confirms we have received your order, but does not guarantee acceptance. If we are unable to fulfil your order, we will notify you and issue a full refund.'],
            },
            {
                title: 'Intellectual Property',
                paragraphs: ['All content on this website, including logos, text, graphics, and images, is the property of Inner Beast and may not be copied, reproduced, or used without our written permission.'],
            },
            {
                title: 'Limitation of Liability',
                paragraphs: ['Inner Beast is not liable for any indirect or incidental loss arising from the use of our website or products, to the fullest extent permitted by law. Nothing in these terms limits your statutory rights as a consumer.'],
            },
            {
                title: 'Governing Law',
                paragraphs: ['These Terms and Conditions are governed by the laws of England and Wales. We may update these terms from time to time, and the version published on this page applies to your order.'],
            },
        ]}
    />
)

export default TermsConditionsPage
