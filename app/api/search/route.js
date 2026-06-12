import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────────
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { query } = await request.json()
    if (!query || query.trim() === '') {
      return NextResponse.json({ success: false, error: 'Query cannot be empty' }, { status: 400 })
    }

    const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const user = session.user
    const queryLower = query.toLowerCase()

    // ── 2. Academic calendar (always available) ────────────────────
    const academicCalendar = {
      odd_semester_start: 'July 1, 2025',
      course_add_drop_deadline: 'July 7, 2025',
      mid_semester_exams: 'July 10–15, 2025',
      mid_sem_results: 'July 25, 2025',
      independence_day_holiday: 'August 15, 2025',
      cultural_fest_utsav: 'August 9–11, 2025',
      tech_fest_technova: 'September 5–7, 2025',
      gandhi_jayanti_holiday: 'October 2, 2025',
      pre_endsem_revision_break: 'November 10–14, 2025',
      end_semester_exams_start: 'November 18, 2025',
      end_semester_exams_end: 'November 28, 2025',
      winter_vacation: 'December 1, 2025 – January 2, 2026',
      even_semester_start: 'January 5, 2026',
      republic_day_holiday: 'January 26, 2026',
      mid_semester_exams_even: 'February 20–25, 2026',
      holi_holiday: 'March 17, 2026',
      final_year_project_deadline: 'April 1, 2026',
      end_semester_exams_even: 'April 20–30, 2026',
      result_declaration_even: 'May 20, 2026',
      convocation: 'May 30, 2026',
      summer_internship: 'May 1 – June 30, 2026'
    }

    // ── 3. Smart MCP data fetching ─────────────────────────────────
    const mcpData = {}
    const fetchErrors = []

    const safeFetch = async (url, key) => {
      try {
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) {
          fetchErrors.push(`${key}: HTTP ${res.status}`)
          mcpData[key] = []
          return
        }
        const json = await res.json()
        mcpData[key] = json.success ? json.data : []
      } catch (err) {
        fetchErrors.push(`${key}: ${err.message}`)
        mcpData[key] = []
      }
    }

    // Determine tomorrow's day name
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowDay = tomorrow.toLocaleDateString('en-US', { weekday: 'long' })
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

    // Library triggers
    const libraryTriggers = ['book', 'library', 'available', 'issue', 'borrow', 'copies', 'author', 'isbn', 'check out', 'shelv', 'read', 'publication']
    if (libraryTriggers.some(t => queryLower.includes(t))) {
      // Try to extract a book name from the query
      const bookNameMatch = query.match(/(?:book|about|on|for|called|titled|named|is|find)\s+["']?([A-Za-z][A-Za-z\s\d:&\-]+?)(?:["']?\s*(?:available|in|at|from|by|\?|$))/i)
      const searchTerm = bookNameMatch?.[1]?.trim() || query
      await safeFetch(`${BASE_URL}/api/mcp/library?action=search&q=${encodeURIComponent(searchTerm)}`, 'library')
      // If no results from specific search, fetch all available books
      if (!mcpData.library || mcpData.library.length === 0) {
        await safeFetch(`${BASE_URL}/api/mcp/library?action=available`, 'library')
      }
    }

    // Cafeteria triggers
    const cafeteriaTriggers = ['lunch', 'breakfast', 'dinner', 'snack', 'menu', 'food', 'eat', 'cafeteria', 'meal', 'dish', 'veg', 'today', 'tomorrow', 'canteen', 'mess', 'hungry', 'what to eat', 'cuisine']
    if (cafeteriaTriggers.some(t => queryLower.includes(t))) {
      if (queryLower.includes('tomorrow') || queryLower.includes('tommorow')) {
        await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=day&day=${encodeURIComponent(tomorrowDay)}`, 'cafeteria')
      } else if (queryLower.includes('breakfast')) {
        await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=meal&type=Breakfast`, 'cafeteria')
      } else if (queryLower.includes('lunch')) {
        await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=meal&type=Lunch`, 'cafeteria')
      } else if (queryLower.includes('dinner')) {
        await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=meal&type=Dinner`, 'cafeteria')
      } else if (queryLower.includes('snack')) {
        await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=meal&type=Snacks`, 'cafeteria')
      } else if (queryLower.includes('veg')) {
        await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=veg`, 'cafeteria')
      } else {
        await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=today`, 'cafeteria')
      }
    }

    // Events triggers
    const eventsTriggers = ['event', 'club', 'workshop', 'fest', 'activity', 'session', 'talk', 'competition', 'upcoming', 'schedule', 'programme', 'seminar', 'hackathon', 'cultural', 'technical', 'organized', 'hosting']
    if (eventsTriggers.some(t => queryLower.includes(t))) {
      const myClubKeywords = ['my club', 'my event', 'clubs i', 'i am part', 'i belong', 'my organisation', 'my team']
      const isMyClubs = myClubKeywords.some(t => queryLower.includes(t))

      if (isMyClubs) {
        if (user.clubs && user.clubs.length > 0) {
          await safeFetch(`${BASE_URL}/api/mcp/events?action=clubs&names=${encodeURIComponent(user.clubs.join(','))}`, 'events')
        } else {
          mcpData.events = []
          mcpData.noClubsMessage = true
        }
      } else {
        // Check if a specific club name is mentioned
        const clubNames = ['IMG', 'SDSLabs', 'GIL', 'EDC', 'Robocon', 'Programming Club', 'AI & ML Community', 'Electronics Club', 'Robotics Club', 'Web Development Community', 'Open Source Community', 'Data Science Community', 'Music Section', 'Dramatics Section', 'Geek Gazette', 'Debating Society', 'Cinematic Section']
        const mentionedClub = clubNames.find(c => queryLower.includes(c.toLowerCase()))
        if (mentionedClub) {
          await safeFetch(`${BASE_URL}/api/mcp/events?action=club&name=${encodeURIComponent(mentionedClub)}`, 'events')
        } else {
          await safeFetch(`${BASE_URL}/api/mcp/events?action=upcoming`, 'events')
        }
      }
    }

    // Academics triggers
    const academicsTriggers = ['course', 'class', 'subject', 'semester', 'lecture', 'credit', 'faculty', 'professor', 'exam', 'deadline', 'drop', 'add course', 'timetable', 'syllabus', 'curriculum', 'study', 'branch', 'my subject', 'enrolled', 'registration', 'academic']
    if (academicsTriggers.some(t => queryLower.includes(t))) {
      let branch = user.branch
      let semester = user.semester

      // Extract branch if explicitly mentioned
      const branchesMap = {
        'cse': 'Computer Science and Engineering (CSE)',
        'ece': 'Electronics and Communication Engineering (ECE)',
        'ee': 'Electrical Engineering (EE)',
        'me': 'Mechanical Engineering (ME)',
        'ce': 'Civil Engineering (CE)',
        'che': 'Chemical Engineering (CHE)',
        'pie': 'Production and Industrial Engineering (PIE)',
        'dsai': 'Data Science and Artificial Intelligence (DSAI)',
        'mnc': 'BS-MS Mathematics and Computing (MnC)',
        'ep': 'Engineering Physics (EP)',
        'ene': 'Energy Engineering (ENE)',
        'mme': 'Metallurgical and Materials Engineering (MME)',
        'bsbe': 'Biosciences and Bioengineering (BSBE)',
        'b.arch': 'Architecture (B.Arch.)',
        'b.des': 'Bachelor of Design (B.Des.)'
      }
      
      for (const [abbr, full] of Object.entries(branchesMap)) {
        // match word boundaries to prevent matching "mee" or "piece"
        const regex = new RegExp(`\\b${abbr}\\b`, 'i')
        if (regex.test(queryLower)) {
          branch = full
          break
        }
      }

      // Extract semester if explicitly mentioned (e.g., "3rd semester", "sem 4", "semester 2")
      const semMatch = queryLower.match(/(?:([1-8])(?:st|nd|rd|th)?\s*(?:sem|semester))|(?:(?:sem|semester)\s*([1-8]))/i)
      if (semMatch) {
        semester = Number(semMatch[1] || semMatch[2])
      }

      if (branch && semester) {
        await safeFetch(`${BASE_URL}/api/mcp/academics?action=courses&branch=${encodeURIComponent(branch)}&semester=${encodeURIComponent(semester)}`, 'academics')
      }
    }

    // Fallback — if nothing matched, fetch academics and upcoming events as default context
    if (Object.keys(mcpData).length === 0 || (Object.keys(mcpData).every(k => mcpData[k].length === 0))) {
      if (user.branch && user.semester) {
        await safeFetch(`${BASE_URL}/api/mcp/academics?action=courses&branch=${encodeURIComponent(user.branch)}&semester=${encodeURIComponent(user.semester)}`, 'academics')
      }
      await safeFetch(`${BASE_URL}/api/mcp/events?action=upcoming`, 'events')
      await safeFetch(`${BASE_URL}/api/mcp/cafeteria?action=today`, 'cafeteria')
    }

    // ── 4. Build the system prompt ─────────────────────────────────
    const systemPrompt = `You are an intelligent and helpful campus assistant for IIT Roorkee (IITR). You assist students by answering questions about the campus — including the library, cafeteria menu, club events, academic courses, exam schedules, deadlines, and general campus life.

STUDENT PROFILE:
- Name / Username: ${user.username || user.email}
- Branch: ${user.branch || 'Not set'}
- Year: ${user.year || 'Not set'}
- Semester: ${user.semester || 'Not set'}
- Clubs: ${user.clubs?.length > 0 ? user.clubs.join(', ') : 'None added yet'}
- Favourite dishes: ${user.favDishes?.length > 0 ? user.favDishes.join(', ') : 'None added yet'}
- Today is: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Tomorrow is: ${tomorrowDay}

ACADEMIC CALENDAR:
${Object.entries(academicCalendar).map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}`).join('\n')}

CAMPUS DATA RETRIEVED FOR THIS QUERY:
${Object.keys(mcpData).length > 0
  ? Object.entries(mcpData)
      .filter(([k]) => k !== 'noClubsMessage')
      .map(([key, data]) => `\n[${key.toUpperCase()} DATA - ${Array.isArray(data) ? data.length : 0} records]\n${JSON.stringify(data, null, 2)}`)
      .join('\n')
  : 'No specific campus data was fetched for this query.'}

${mcpData.noClubsMessage ? '\n[NOTE: Student asked about their club events but has not added any clubs to their profile yet.]' : ''}

STRICT RESPONSE RULES — READ CAREFULLY:

1. ALWAYS respond with ONLY a valid JSON object. No markdown. No code fences. No explanation text before or after. Just the raw JSON object.

2. The JSON must follow this exact structure:
{
  "tableTitle": "A clear, descriptive title for the table",
  "columns": ["Column 1", "Column 2", "Column 3"],
  "rows": [
    ["value1", "value2", "value3"],
    ["value1", "value2", "value3"]
  ],
  "note": "Any important note, warning, or follow-up message. Empty string if nothing to add."
}

3. LIBRARY RULES:
   - If a book has availableCopies > 0 OR status is "Available": set note to "✅ This book is available in the library. You can visit the library to issue it."
   - If availableCopies is 0 OR status is "Checked Out": set note to "❌ This book is currently checked out. Please check back later or ask the librarian about reservations."
   - Always show columns: Title, Author, Category, Available Copies, Total Copies, Shelf Location, Status

4. CAFETERIA RULES:
   - Always show columns: Item Name, Meal Type, Price (₹), Veg/Non-Veg, Calories, Allergens, Available From, Available Until
   - For "Is Veg" or isVeg field: show "🟢 Veg" if true, "🔴 Non-Veg" if false
   - If asking about tomorrow: clearly say "Tomorrow is ${tomorrowDay}" in the tableTitle

5. EVENTS RULES:
   - Always show columns: Event Name, Organizing Club, Date, Start Time, Venue, Category, Description
   - If student asked about their clubs but has no clubs added:
     tableTitle = "No Club Events Found"
     rows = [["You haven't added any clubs to your profile yet"]]
     note = "Go to the Home tab → Edit Profile to add the clubs you are part of. Then you can see events for your clubs here."
   - Sort events by date (earliest first)

6. ACADEMICS RULES:
   - Always use the student's branch (${user.branch}) and semester (${user.semester}) automatically — never ask the student to specify these
   - Always show columns: Course Code, Course Name, Faculty, Credits, Semester
   - If query is about a deadline or academic calendar date: answer using the Academic Calendar data above

7. IF NO DATA IS AVAILABLE FOR THE SPECIFIC QUERY:
   - Do NOT just say "Data not available"
   - Instead, check if the Academic Calendar has relevant information and use that
   - If truly nothing is relevant: tableTitle = "Information Not Available", columns = ["Message"], rows = [["This specific information is not in our campus database. Please check the official IITR website or contact the relevant department."]], note = ""

8. IMPORTANT — USE CONTEXT INTELLIGENTLY:
   - "What is for lunch today" → filter cafeteria data for today's lunch items
   - "What is for lunch tomorrow" → filter cafeteria data for ${tomorrowDay} lunch items
   - "When is the add/drop deadline" → use academic calendar data
   - "My courses this semester" → use academics data filtered for student's branch and semester
   - "Events for my clubs" → use events data filtered for student's clubs
   - "Is [book] available" → check library data for that specific book

9. Keep table rows concise. If a field is null or empty, show "—" instead of null or undefined.
10. The tableTitle should be informative and specific, e.g. "Monday Lunch Menu", "Upcoming IMG Events", "CSE Semester 3 Courses", not just "Results".`

    // ── 5. Call Gemini (with retry for rate limits) ──────────────────
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    })

    let rawText
    const maxRetries = 3
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent([
          { text: systemPrompt },
          { text: `Student query: "${query}"` }
        ])
        rawText = result.response.text()
        break // Success — exit retry loop
      } catch (geminiError) {
        if (geminiError.status === 429 && attempt < maxRetries) {
          const waitMs = Math.pow(2, attempt + 1) * 1000 // 2s, 4s, 8s
          console.log(`Gemini 429 — retrying in ${waitMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, waitMs))
          continue
        }
        throw geminiError // Re-throw if not retryable
      }
    }

    // ── 6. Parse and validate response ────────────────────────────
    let parsed
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()
      parsed = JSON.parse(cleaned)

      // Validate structure
      if (!parsed.tableTitle || !Array.isArray(parsed.columns) || !Array.isArray(parsed.rows)) {
        throw new Error('Invalid response structure')
      }

      // Ensure rows are arrays of strings
      parsed.rows = parsed.rows.map(row =>
        Array.isArray(row) ? row.map(cell => cell?.toString() ?? '—') : [String(row)]
      )
    } catch (parseError) {
      console.error('JSON parse error:', parseError.message)
      console.error('Raw response:', rawText)
      return NextResponse.json({
        success: true,
        result: {
          tableTitle: 'Response Error',
          columns: ['Message'],
          rows: [['The AI returned an unreadable response. Please try rephrasing your question.']],
          note: ''
        }
      })
    }

    return NextResponse.json({ success: true, result: parsed })

  } catch (error) {
    console.error('Search route error:', error)

    if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
      return NextResponse.json({
        success: false,
        error: 'The AI service is currently rate limited. Please wait 30 seconds and try again.'
      }, { status: 429 })
    }

    if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
      return NextResponse.json({
        success: false,
        error: 'API key configuration error. Please contact the administrator.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: false,
      error: 'Something went wrong while processing your request. Please try again.',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}