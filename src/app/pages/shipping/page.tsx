import PolicyPage from '@/components/Content/PolicyPage'

const ShippingPage = () => (
    <PolicyPage
        breadcrumb="Shipping Policy"
        eyebrow="DELIVERY"
        title="From our door to yours."
        intro="We aim to dispatch every order as quickly and carefully as possible so your gear reaches you ready to train."
        image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=85"
        imageAlt="Packages prepared for delivery"
        lastUpdated="July 2025"
        sections={[
            {
                title: 'Order Processing',
                bullets: [
                    'Orders are processed within 1 to 2 business days.',
                    'Orders placed on weekends or public holidays will be processed on the next business day.',
                    'During sales and peak periods, processing may take slightly longer.',
                ],
            },
            {
                title: 'Shipping Times',
                paragraphs: ['Estimated delivery times once your order has been dispatched:'],
                bullets: [
                    'UK: 2 to 5 business days',
                    'Europe: 5 to 10 business days',
                    'International: 7 to 15 business days',
                ],
            },
            {
                title: 'Shipping Costs',
                paragraphs: ['Shipping charges are calculated at checkout based on your location and the items in your cart. Any available free shipping promotion will be applied automatically before you pay.'],
            },
            {
                title: 'Track Your Order',
                paragraphs: ['Once your order has shipped, you will receive a confirmation email with tracking details so you can follow your parcel every step of the way.'],
            },
            {
                title: 'Delivery Delays',
                paragraphs: ['Delivery times are estimates and may vary during busy periods, sales, or due to reasons outside our control such as courier delays, customs clearance, or extreme weather. We appreciate your patience and will always do our best to keep you updated.'],
            },
            {
                title: 'Wrong or Failed Deliveries',
                paragraphs: ['Please double check your delivery address at checkout. If a parcel is returned to us because of an incorrect address or a missed delivery, a re-shipping charge may apply. If your tracking shows delivered but you have not received your order, contact us and we will help you resolve it.'],
            },
        ]}
    />
)

export default ShippingPage
