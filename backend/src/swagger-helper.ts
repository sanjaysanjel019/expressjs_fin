// src/utils/swaggerHelpers.ts

/**
 * Common response schemas that can be reused across endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *         data:
 *           type: object
 *           description: Response data
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *               example: 1
 *             totalPages:
 *               type: integer
 *               example: 10
 *             totalItems:
 *               type: integer
 *               example: 100
 *             hasNextPage:
 *               type: boolean
 *               example: true
 *             hasPrevPage:
 *               type: boolean
 *               example: false
 *             limit:
 *               type: integer
 *               example: 10
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: An error occurred
 *         error:
 *           type: string
 *           example: Detailed error message
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       description: Page number for pagination
 *     LimitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 10
 *       description: Number of items per page
 *     SearchParam:
 *       in: query
 *       name: search
 *       schema:
 *         type: string
 *       description: Search term
 *     SortParam:
 *       in: query
 *       name: sort
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: asc
 *       description: Sort order
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     ForbiddenError:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *     ValidationError:
 *       description: Invalid input data
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ValidationError'
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 */

// Helper function to generate enum documentation
export const generateEnumDoc = (enumObj: Record<string, string>, description: string) => {
    const values = Object.values(enumObj);
    return {
      type: 'string',
      enum: values,
      description: `${description}. Possible values: ${values.join(', ')}`,
    };
  };
  
  // Helper function to create standardized error responses
  export const createErrorResponse = (message: string, statusCode: number) => {
    return {
      [statusCode]: {
        description: message,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse'
            }
          }
        }
      }
    };
  };