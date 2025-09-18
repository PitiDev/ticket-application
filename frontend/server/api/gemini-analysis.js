// server/api/gemini-analysis.js
export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event)
    const { goldData, goldPrice } = body

    // Get Gemini API key from runtime config (or use the one from your code for testing)
    const config = useRuntimeConfig()
    const apiKey = config.geminiApiKey || 'AIzaSyAaAY5zRiBbiNFQ3v3ipUyWc5-py96qwjo'

    // Update the promptData in the Gemini API call
    const promptData = {
      dateRange: {
        startDate: goldData.summary?.current_gold_price?.date || 'N/A',
        endDate: new Date().toISOString().split('T')[0]
      },
      goldTransactions: {
        total: goldData.summary?.total_transactions || 0,
        profitable: goldData.summary?.profitable_transactions || 0,
        totalInvestment: goldData.summary?.total_investment || 'LAK 0',
        currentValue: goldData.summary?.total_current_value || 'LAK 0',
        profitLoss: goldData.summary?.total_profit_loss || 'LAK 0',
        profitLossPercentage: goldData.summary?.total_profit_loss_percentage || '0%',
        isProfitable: goldData.summary?.is_overall_profitable || false,
        totalGoldWeight: goldData.summary?.total_gold_weight || '0 grams'
      },
      // Add this section for selling data
      sellTransactions: body.hasSellingData ? {
        total: body.sellGoldData?.summary?.total_transactions || 0,
        totalSoldAmount: body.sellGoldData?.summary?.total_sold_amount || 'LAK 0',
        totalGoldWeight: body.sellGoldData?.summary?.total_gold_weight || '0 grams',
        averagePricePerGram: body.sellGoldData?.summary?.average_price_per_gram || 'LAK 0'
      } : null,
      // Add this section for P2P transfer data
      p2pTransfers: body.hasP2PData ? {
        total: body.p2pGoldData?.summary?.total_transactions || 0,
        totalGoldWeight: body.p2pGoldData?.summary?.total_gold_weight || '0 grams',
        transfersReceived: body.p2pGoldData?.summary?.transfers_received || 0,
        transfersSent: body.p2pGoldData?.summary?.transfers_sent || 0,
        netWeight: body.netPosition?.p2pNetWeight || '0 grams'
      } : null,
      // Add net position data
      netPosition: (body.hasSellingData || body.hasP2PData) ? {
        weight: body.netPosition?.weight || '0 grams',
        value: body.netPosition?.value || 'LAK 0'
      } : null,
      currentGoldPrice: {
        date: goldData.summary?.current_gold_price?.date || 'N/A',
        buyRate: goldData.summary?.current_gold_price?.buy_rate || 'LAK 0',
        sellRate: goldData.summary?.current_gold_price?.sell_rate || 'LAK 0'
      },
      recommendations: goldData.recommendations || []
    }

    // Update the prompt to include P2P data
    const prompt = `
  ທ່ານເປັນນັກວິເຄາະການລົງທຶນໃນຄຳທີ່ມີປະສົບການສູງໃນລາວ ແລະ ກຳລັງວິເຄາະຂໍ້ມູນກ່ຽວກັບການລົງທຶນຄຳ.
  ກະລຸນາວິເຄາະຂໍ້ມູນລຸ່ມນີ້ແລະໃຫ້ຄຳແນະນຳເປັນພາສາລາວ ແລະ ພາສາອັງກິດ:

  **ຂໍ້ມູນການລົງທຶນຄຳ:**

  **ສະຫຼຸບລວມການຊື້:**
  - ລາຍການທັງໝົດ: ${promptData.goldTransactions.total}
  - ມີກຳໄລ: ${promptData.goldTransactions.profitable}
  - ລົງທຶນທັງໝົດ: ${promptData.goldTransactions.totalInvestment}
  - ມູນຄ່າປັດຈຸບັນ: ${promptData.goldTransactions.currentValue}
  - ກຳໄລ/ຂາດທຶນ: ${promptData.goldTransactions.profitLoss} (${promptData.goldTransactions.profitLossPercentage})
  - ນ້ຳໜັກຄຳທັງໝົດ: ${promptData.goldTransactions.totalGoldWeight}

  ${promptData.sellTransactions ? `**ສະຫຼຸບລວມການຂາຍ:**
  - ລາຍການທັງໝົດ: ${promptData.sellTransactions.total}
  - ມູນຄ່າທັງໝົດທີ່ຂາຍ: ${promptData.sellTransactions.totalSoldAmount}
  - ນ້ຳໜັກຄຳທີ່ຂາຍໄປ: ${promptData.sellTransactions.totalGoldWeight}
  - ລາຄາສະເລ່ຍຕໍ່ກຣາມ: ${promptData.sellTransactions.averagePricePerGram}` : ''}

  ${promptData.p2pTransfers ? `**ສະຫຼຸບລວມການໂອນ P2P:**
  - ລາຍການທັງໝົດ: ${promptData.p2pTransfers.total}
  - ນ້ຳໜັກຄຳທີ່ໂອນທັງໝົດ: ${promptData.p2pTransfers.totalGoldWeight}
  - ການໂອນທີ່ໄດ້ຮັບ: ${promptData.p2pTransfers.transfersReceived}
  - ການໂອນທີ່ສົ່ງອອກ: ${promptData.p2pTransfers.transfersSent}
  - ນ້ຳໜັກຄຳສຸດທິຈາກການໂອນ: ${promptData.p2pTransfers.netWeight}` : ''}

  ${promptData.netPosition ? `**ສະຖານະຄຳສຸດທິ:**
  - ນ້ຳໜັກຄຳສຸດທິ: ${promptData.netPosition.weight}
  - ມູນຄ່າສຸດທິ: ${promptData.netPosition.value}` : ''}

  **ລາຄາຄຳປັດຈຸບັນ:**
  - ວັນທີ: ${promptData.currentGoldPrice.date}
  - ອັດຕາຊື້: ${promptData.currentGoldPrice.buyRate}
  - ອັດຕາຂາຍ: ${promptData.currentGoldPrice.sellRate}

  **ຄຳແນະນຳຈາກລະບົບ:**
  ${promptData.recommendations.map(rec =>
      `- ${rec.type}: ${rec.message}\n  ${rec.details || ''}`
    ).join('\n')}

  ກະລຸນາໃຫ້ການວິເຄາະແບບຄົບຖ້ວນທີ່ປະກອບມີ:

  **MARKET_OVERVIEW:**
  [ພາບລວມຂອງຕະຫຼາດຄຳແລະແນວໂນ້ມປະຈຸບັນ]

  **INVESTMENT_ANALYSIS:**
  [ການວິເຄາະຜົນງານຂອງການລົງທຶນຄຳນີ້]

  **KEY_INSIGHTS:**
  [ຂໍ້ສັງເກດແລະຂໍ້ມູນສຳຄັນ]

  **RECOMMENDATIONS:**
  [ຄຳແນະນຳກ່ຽວກັບເວລາທີ່ຄວນຂາຍຫຼືຖືຄຳ]

  **RISK_ANALYSIS:**
  [ການວິເຄາະຄວາມສ່ຽງຂອງພອດການລົງທຶນຄຳນີ້]

  **FUTURE_OUTLOOK:**
  [ທັດສະນະກ່ຽວກັບຕະຫຼາດຄຳໃນອະນາຄົດ]

  ກະລຸນາຕອບໃນຮູບແບບ JSON ທີ່ມີໂຄງສ້າງດັ່ງນີ້:
  {
    "market_overview": "...",
    "investment_analysis": "...",
    "key_insights": "...",
    "recommendations": "...",
    "risk_analysis": "...",
    "future_outlook": "..."
  }

  ການວິເຄາະທຸກຢ່າງຄວນມີທັງພາສາລາວ ແລະ ພາສາອັງກິດ ໂດຍໃຊ້ຮູບແບບ: "ພາສາລາວ [English translation]"
`

    // Call Gemini API
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`)
    }

    const result = await response.json()

    let analysisText
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      analysisText = result.candidates[0].content.parts[0].text
    } else {
      throw new Error('Invalid Gemini API response')
    }

    // Try to parse JSON from response
    let parsedAnalysis
    try {
      // Extract JSON from the response text
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[0])
      } else {
        // Fallback to manual extraction
        parsedAnalysis = {
          market_overview: extractSection(analysisText, 'MARKET_OVERVIEW'),
          investment_analysis: extractSection(analysisText, 'INVESTMENT_ANALYSIS'),
          key_insights: extractSection(analysisText, 'KEY_INSIGHTS'),
          recommendations: extractSection(analysisText, 'RECOMMENDATIONS'),
          risk_analysis: extractSection(analysisText, 'RISK_ANALYSIS'),
          future_outlook: extractSection(analysisText, 'FUTURE_OUTLOOK')
        }
      }
    } catch (err) {
      console.error('Error parsing AI response:', err)
      parsedAnalysis = {
        error: true,
        message: 'Failed to parse AI response',
        raw_text: analysisText
      }
    }

    // Format the response
    const formattedHtml = formatAnalysisToHtml(parsedAnalysis)

    return {
      analysis: formattedHtml,
      raw: parsedAnalysis,
      timestamp: new Date().toISOString(),
      success: true
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      analysis: '<div class="text-red-500 p-4">ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບ AI ໄດ້. ກະລຸນາລອງໃໝ່ໃນພາຍຫຼັງ.</div>',
      success: false,
      error: error.message
    }
  }
})

// Helper functions from your example code
function extractSection(text, sectionName) {
  const regex = new RegExp(`\\*\\*${sectionName}:\\*\\*([\\s\\S]*?)(?=\\*\\*|$)`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : ''
}

function formatAnalysisToHtml(analysis) {
  if (analysis.error) {
    return `<div class="text-red-500">${analysis.message}</div>`
  }

  let html = '<div class="space-y-6">'

  if (analysis.market_overview) {
    html += `
      <div>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">ພາບລວມຕະຫຼາດ / Market Overview</h3>
        <div class="text-gray-700">${formatText(analysis.market_overview)}</div>
      </div>
    `
  }

  if (analysis.investment_analysis) {
    html += `
      <div>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">ການວິເຄາະການລົງທຶນ / Investment Analysis</h3>
        <div class="text-gray-700">${formatText(analysis.investment_analysis)}</div>
      </div>
    `
  }

  if (analysis.key_insights) {
    html += `
      <div>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">ຂໍ້ສັງເກດສຳຄັນ / Key Insights</h3>
        <div class="text-gray-700">${formatText(analysis.key_insights)}</div>
      </div>
    `
  }

  if (analysis.recommendations) {
    html += `
      <div>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">ຄຳແນະນຳ / Recommendations</h3>
        <div class="text-gray-700">${formatText(analysis.recommendations)}</div>
      </div>
    `
  }

  if (analysis.risk_analysis) {
    html += `
      <div>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">ການວິເຄາະຄວາມສ່ຽງ / Risk Analysis</h3>
        <div class="text-gray-700">${formatText(analysis.risk_analysis)}</div>
      </div>
    `
  }

  if (analysis.future_outlook) {
    html += `
      <div>
        <h3 class="text-lg font-semibold text-amber-800 mb-2">ມຸມມອງອະນາຄົດ / Future Outlook</h3>
        <div class="text-gray-700">${formatText(analysis.future_outlook)}</div>
      </div>
    `
  }

  html += '</div>'

  return html
}

function formatText(text) {
  if (!text) return ''

  return text
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\s*-\s+/gm, '• ')
}