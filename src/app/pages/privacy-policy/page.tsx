import PolicyPage from '@/components/Content/PolicyPage'

const PrivacyPolicyPage = () => (
    <PolicyPage
        breadcrumb="Privacy Policy"
        eyebrow="YOUR DATA"
        title="Privacy matters to us."
        intro="At Inner Beast, we value your privacy and are committed to protecting the personal information you share with us."
        image="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1600&q=85"
        imageAlt="Secure online shopping and payment"
        lastUpdated="July 2025"
        sections={[
            {
                title: 'Information We Collect',
                paragraphs: ['We collect personal information such as your name, email address, delivery address, phone number, and payment details solely to process your order and provide customer support. We may also collect basic technical information such as your browser type and how you use our website.'],
            },
            {
                title: 'How We Use Your Information',
                paragraphs: ['Your information may be used to:'],
                bullets: [
                    'Process payments securely.',
                    'Deliver your order and provide order updates.',
                    'Respond to your questions and support requests.',
                    'Improve our website, products, and customer experience.',
                    'Send promotional emails, only if you have opted in.',
                ],
            },
            {
                title: 'Cookies',
                paragraphs: ['Our website uses cookies to keep your cart working, remember your preferences, and understand how the site is used. You can control or disable cookies through your browser settings, though some features may not work as intended without them.'],
            },
            {
                title: 'Sharing Your Information',
                paragraphs: ['We do not sell or rent your personal information to third parties. We only share the details needed with trusted partners who help us run our business, such as payment processors and delivery couriers, and only so they can perform their service.'],
            },
            {
                title: 'Data Security',
                paragraphs: ['All payment information is processed securely through trusted payment providers. We take reasonable technical and organisational measures to keep your information safe, though no method of transmission over the internet can be guaranteed to be completely secure.'],
            },
            {
                title: 'Your Rights',
                paragraphs: ['You have the right to access, correct, or request deletion of the personal information we hold about you, and to opt out of marketing at any time. To make a request, simply get in touch with our team.'],
            },
            {
                title: 'Updates to This Policy',
                paragraphs: ['We may update this Privacy Policy from time to time. Any changes will be posted on this page. By using our website, you agree to the collection and use of information as described in this Privacy Policy.'],
            },
        ]}
    />
)

export default PrivacyPolicyPage
