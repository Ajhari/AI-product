import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())
const PORT = 8080

const rentals = [
  {
    id: 'adyar-2bhk',
    title: 'Sunny 2BHK near Adyar signal',
    location: 'Adyar, Chennai',
    type: 'Apartment',
    rent: 32000,
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    description:
      'A bright apartment with quick access to shops, buses, and everyday needs.',
    features: ['2 bedrooms', 'Balcony', 'Covered parking', 'Family friendly'],
  },
  {
    id: 'velachery-studio',
    title: 'Compact studio near Velachery MRTS',
    location: 'Velachery, Chennai',
    type: 'Studio',
    rent: 17000,
    imageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    description:
      'A simple studio for students or working professionals who want a short commute.',
    features: ['Furnished', 'Lift access', 'Near transit', 'Single occupant'],
  },
  {
    id: 'anna-nagar-house',
    title: 'Independent house with small garden',
    location: 'Anna Nagar, Chennai',
    type: 'House',
    rent: 35000,
    imageUrl:
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    description:
      'A calm home with extra outdoor space and good access to schools nearby.',
    features: ['3 bedrooms', 'Garden', 'Pet friendly', 'Quiet street'],
  },
  {
    id: 'omr-apartment',
    title: 'Apartments with privacy and security',
    location: 'Thoraipakkam, Chennai',
    type: 'Apartment',
    rent: 24000,
    imageUrl:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    description:
      'A practical rental for office commuters with building amenities included.',
    features: ['2 bedrooms', 'Gym access', 'Power backup', 'Security'],
  },
  {
    id: 'auro-villa',
    title: 'Modern apartment close to OMR offices',
    location: 'Auroville, Pondy',
    type: 'Villa',
    rent: 18000,
    imageUrl:
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description:
      'A practical rental for office commuters with building amenities included.',
    features: ['2 bedrooms', 'Gym access', 'Power backup', 'Security'],
  },
  {
    id: 'kolli-hills',
    title: 'kolli hills',
    location: 'kolli hills,Namakal',
    type: 'villa',
    rent: 13000,
    imageUrl:
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/681998972.jpg?k=3f989e98a4dfe8ab1a76d69623df330690f1db091fb7ba8e18b4c8d43ba0784f&o=',
    description:
      'A simple villa for tourist who want a short commute.',
    features: ['Furnished', 'Lift access', 'Near transit', 'Single occupant'],
  },
]
const inquiries = []

function findRentalById(rentalId) {
  return rentals.find((item) => item.id === rentalId)
}

function isInquiryMissingFields(inquiry) {
  return !inquiry.rentalId || !inquiry.name || !inquiry.phone || !inquiry.message
}

app.get('/api/health', (request, response) => {
  response.json({ status: 'ok', message: 'Rental Scout API is running' })
})

app.get('/api/rentals', (request, response) => {
  response.json(rentals)
})

app.get('/api/rentals/:rentalId', (request, response) => {
  const rentalId = request.params.rentalId
  const rental = findRentalById(rentalId)

  if (!rental) {
    return response.status(404).json({ message: 'Rental not found' })
  }

  response.json(rental)
})

app.get('/api/inquiries', (request, response) => {
  response.json(inquiries)
})

app.post('/api/inquiries', (request, response) => {
  const { rentalId, name, phone, message } = request.body
  const inquiryData = { rentalId, name, phone, message }

  if (isInquiryMissingFields(inquiryData)) {
    return response.status(400).json({
      message: 'Rental, name, phone, and message are required',
    })
  }

  const rental = findRentalById(rentalId)

  if (!rental) {
    return response.status(404).json({ message: 'Rental not found' })
  }

  const newInquiry = {
    id: Date.now().toString(),
    rentalId,
    name,
    phone,
    message,
  }

  inquiries.push(newInquiry)

  response.status(201).json({
    message: 'Inquiry received',
    inquiry: newInquiry,
  })
})

app.listen(PORT, () => {
  console.log(`Rental Scout API is running at http://localhost:${PORT}`)
})
