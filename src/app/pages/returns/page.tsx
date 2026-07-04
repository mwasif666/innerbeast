import PolicyPage from '@/components/Content/PolicyPage'

const ReturnsPage = () => (
    <PolicyPage
        breadcrumb="Returns & Refunds"
        eyebrow="SHOP WITH CONFIDENCE"
        title="Returns made straightforward."
        intro="Your satisfaction matters to us. If you are not completely happy with your purchase, you may return your item within 30 days of delivery."
        image="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85"
        imageAlt="Premium clothing displayed in a retail space"
        lastUpdated="July 2025"
        sections={[
            {
                title: 'Return Eligibility',
                paragraphs: ['To be eligible for a return, your item must meet the following conditions:'],
                bullets: [
                    'Item must be unworn, unwashed, and unused.',
                    'Original tags must still be attached.',
                    'Item must be returned in its original packaging.',
                    'Return must be requested within 30 days of delivery.',
                ],
            },
            {
                title: 'How to Start a Return',
                paragraphs: ['Getting your return moving is simple:'],
                bullets: [
                    'Contact our team with your order number and the item you would like to return.',
                    'We will confirm your return and share the return address and next steps.',
                    'Pack the item securely and send it back within the return window.',
                ],
            },
            {
                title: 'Exchanges',
                paragraphs: ['Need a different size or colour? Let us know when you start your return and we will help you swap it, subject to availability. If the item you want is out of stock, we will process a refund instead.'],
            },
            {
                title: 'Refunds',
                paragraphs: ['Once your return has been received and inspected, your refund will be processed to your original payment method. Please allow a few business days for the amount to appear, depending on your bank or card provider.'],
            },
            {
                title: 'Return Shipping Costs',
                paragraphs: ['Unless your item arrived faulty or incorrect, return shipping is the responsibility of the customer. We recommend using a tracked service, as we cannot be responsible for returns lost in transit.'],
            },
            {
                title: 'Faulty or Incorrect Items',
                paragraphs: ['If you receive an item that is faulty, damaged, or not what you ordered, contact us within 7 days of delivery. We will arrange a replacement or full refund, including any return shipping costs, at no charge to you.'],
            },
            {
                title: 'Items We Cannot Refund',
                paragraphs: ['Items damaged through normal wear, misuse, or washing contrary to the care instructions cannot be refunded. Any item returned outside the 30 day window or without its original tags may not be accepted.'],
            },
        ]}
    />
)

export default ReturnsPage
