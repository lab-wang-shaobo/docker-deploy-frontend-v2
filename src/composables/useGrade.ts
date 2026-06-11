import { ref } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

// GraphQL query - identical to Angular
const GET_GRADE_FROM_SCORE = gql`
  query getGradeFromScore($score: Float!) {
    getGradeFromScore(score: $score) {
      grade
    }
  }
`

// Type definitions
interface GradeResponse {
  getGradeFromScore: {
    grade: string
  }
}

interface GradeVariables extends Record<string, unknown> {
  score: number
}

export function useGrade() {
  const grade = ref<string>('')
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // Using useLazyQuery to match Angular's manual query execution
  const { load, refetch } = useLazyQuery<
    GradeResponse,
    GradeVariables
  >(GET_GRADE_FROM_SCORE)

  let isFirstLoad = true

  const getGradeFromScore = async (score: number) => {
    isLoading.value = true
    error.value = null

    try {
      let result

      if (isFirstLoad) {
        // First call uses load()
        const loadResult = await load(GET_GRADE_FROM_SCORE, { score })
        result = loadResult?.data
        isFirstLoad = false
      } else {
        // Subsequent calls use refetch()
        const refetchResult = await refetch({ score })
        result = refetchResult?.data
      }

      if (result) {
        grade.value = result.getGradeFromScore.grade
      }
    } catch (err) {
      error.value = err as Error
      console.error('Error fetching grade:', err)
    } finally {
      isLoading.value = false
    }

    return grade.value
  }

  return {
    grade,
    isLoading,
    error,
    getGradeFromScore,
  }
}
